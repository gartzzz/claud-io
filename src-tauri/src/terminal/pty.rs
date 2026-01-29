use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use std::io::{Read, Write};
use tokio::sync::mpsc;

pub struct PtyProcess {
    master: Box<dyn MasterPty + Send>,
    writer: Box<dyn Write + Send>,
}

impl PtyProcess {
    pub fn spawn(
        cols: u16,
        rows: u16,
        command: Option<&str>,
    ) -> Result<(Self, mpsc::Receiver<Vec<u8>>), String> {
        let pty_system = native_pty_system();

        let pair = pty_system
            .openpty(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to open PTY: {}", e))?;

        let mut cmd = if let Some(shell_cmd) = command {
            let mut cmd = CommandBuilder::new("sh");
            cmd.arg("-c");
            cmd.arg(shell_cmd);
            cmd
        } else {
            // Default to user's shell or zsh
            let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string());
            let mut cmd = CommandBuilder::new(&shell);
            cmd.arg("-l"); // Login shell for proper environment
            cmd
        };

        // Set up environment
        cmd.env("TERM", "xterm-256color");
        cmd.env("COLORTERM", "truecolor");

        // Set current directory to home
        if let Ok(home) = std::env::var("HOME") {
            cmd.cwd(&home);
        }

        let _child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn command: {}", e))?;

        let writer = pair
            .master
            .take_writer()
            .map_err(|e| format!("Failed to get writer: {}", e))?;

        let mut reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| format!("Failed to get reader: {}", e))?;

        // Create channel for output streaming
        let (tx, rx) = mpsc::channel::<Vec<u8>>(100);

        // Spawn reader thread
        std::thread::spawn(move || {
            let mut buffer = [0u8; 4096];
            loop {
                match reader.read(&mut buffer) {
                    Ok(0) => break, // EOF
                    Ok(n) => {
                        if tx.blocking_send(buffer[..n].to_vec()).is_err() {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
        });

        Ok((
            Self {
                master: pair.master,
                writer,
            },
            rx,
        ))
    }

    pub fn write(&mut self, data: &[u8]) -> Result<(), String> {
        self.writer
            .write_all(data)
            .map_err(|e| format!("Write error: {}", e))?;
        self.writer
            .flush()
            .map_err(|e| format!("Flush error: {}", e))?;
        Ok(())
    }

    pub fn resize(&self, cols: u16, rows: u16) -> Result<(), String> {
        self.master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Resize error: {}", e))
    }
}
