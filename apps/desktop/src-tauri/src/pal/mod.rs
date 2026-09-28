pub mod storage {
    use std::collections::HashMap;
    use std::sync::Mutex;

    static SECURE_STORE: Mutex<Option<HashMap<String, String>>> = Mutex::new(None);

    pub fn set_secret(key: &str, value: &str) -> Result<(), String> {
        let mut store = SECURE_STORE.lock().map_err(|e| e.to_string())?;
        if store.is_none() {
            *store = Some(HashMap::new());
        }
        if let Some(ref mut map) = *store {
            map.insert(key.to_string(), value.to_string());
        }
        Ok(())
    }

    pub fn get_secret(key: &str) -> Result<Option<String>, String> {
        let store = SECURE_STORE.lock().map_err(|e| e.to_string())?;
        if let Some(ref map) = *store {
            Ok(map.get(key).cloned())
        } else {
            Ok(None)
        }
    }
}
