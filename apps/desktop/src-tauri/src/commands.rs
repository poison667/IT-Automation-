use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub version: String,
    pub is_native_desktop: bool,
}

#[tauri::command]
pub fn get_system_info() -> SystemInfo {
    #[cfg(target_os = "windows")]
    let os = "windows".to_string();
    #[cfg(target_os = "linux")]
    let os = "linux".to_string();
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    let os = "unix".to_string();

    SystemInfo {
        os,
        arch: std::env::consts::ARCH.to_string(),
        version: "2.0.0-PROD".to_string(),
        is_native_desktop: true,
    }
}

#[tauri::command]
pub fn get_app_paths() -> Result<serde_json::Value, String> {
    #[cfg(target_os = "windows")]
    let base_dir = std::env::var("LOCALAPPDATA").unwrap_or_else(|_| "C:\\AppData".to_string());
    #[cfg(target_os = "linux")]
    let base_dir = std::env::var("XDG_DATA_HOME").unwrap_or_else(|_| {
        let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
        format!("{}/.local/share", home)
    });

    Ok(serde_json::json!({
        "data_dir": format!("{}/nexusit/data", base_dir),
        "logs_dir": format!("{}/nexusit/logs", base_dir),
        "cache_dir": format!("{}/nexusit/cache", base_dir),
    }))
}
