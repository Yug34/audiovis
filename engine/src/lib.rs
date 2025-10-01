use wasm_bindgen::prelude::*;

// Import the `window.alert` function from the Web.
#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

/// Calculate the width of a single bar in the visualization
#[wasm_bindgen]
pub fn calculate_bar_width(
    canvas_width: f64,
    fft_size: u32,
    gap_between_bars: f64,
    padding: f64,
    buffer_length: u32,
) -> f64 {
    (canvas_width - (fft_size as f64) * (gap_between_bars / 2.0) - padding) / (buffer_length as f64)
}

/// Calculate the average value of a Uint8Array (for audio levels)
#[wasm_bindgen]
pub fn calculate_average(data: &[u8]) -> f64 {
    if data.is_empty() {
        return 0.0;
    }
    let sum: u32 = data.iter().map(|&x| x as u32).sum();
    sum as f64 / data.len() as f64
}

/// Calculate RGB color value for frequency domain visualization
/// Returns a packed u32 in the format 0xRRGGBB
#[wasm_bindgen]
pub fn calculate_freq_color(bar_height: u8, is_right_channel: bool) -> u32 {
    let intensity = bar_height as u32 + 100;
    if is_right_channel {
        // Green for right channel: rgb(50, intensity, 50)
        (50 << 16) | (intensity << 8) | 50
    } else {
        // Blue for left channel: rgb(50, 50, intensity)
        (50 << 16) | (50 << 8) | intensity
    }
}

/// Calculate RGB color value for audio level visualization
/// Returns a packed u32 in the format 0xRRGGBB
#[wasm_bindgen]
pub fn calculate_level_color(average: f64, is_right_channel: bool) -> u32 {
    let intensity = (average as u32).min(255) + 100;
    let intensity = intensity.min(255);
    if is_right_channel {
        // Green for right channel
        (50 << 16) | (intensity << 8) | 50
    } else {
        // Blue for left channel
        (50 << 16) | (50 << 8) | intensity
    }
}

/// Process audio data and return visualization parameters
/// Returns [barWidth, leftAverage, rightAverage]
#[wasm_bindgen]
pub fn process_audio_data(
    canvas_width: f64,
    canvas_height: f64,
    fft_size: u32,
    gap_between_bars: f64,
    padding: f64,
    buffer_length: u32,
    data_left: &[u8],
    data_right: &[u8],
) -> Vec<f64> {
    let bar_width = calculate_bar_width(canvas_width, fft_size, gap_between_bars, padding, buffer_length);
    let left_avg = calculate_average(data_left);
    let right_avg = calculate_average(data_right);
    
    vec![bar_width, left_avg, right_avg]
}