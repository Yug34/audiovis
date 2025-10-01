declare module 'engine' {
  export function add(a: number, b: number): number;
  export function hello(): string;
  export default function init(module_or_path?: any): Promise<any>;
  export function greet(name: string): void;

  export function calculate_bar_width(
    canvas_width: number,
    fft_size: number,
    gap_between_bars: number,
    padding: number,
    buffer_length: number
  ): number;

  export function calculate_average(data: Uint8Array): number;

  export function calculate_freq_color(
    bar_height: number,
    is_right_channel: boolean
  ): number;

  export function calculate_level_color(
    average: number,
    is_right_channel: boolean
  ): number;

  export function process_audio_data(
    canvas_width: number,
    canvas_height: number,
    fft_size: number,
    gap_between_bars: number,
    padding: number,
    buffer_length: number,
    data_left: Uint8Array,
    data_right: Uint8Array
  ): Float64Array;
}

// Export the engine module type for use in typeof expressions
export type EngineModule = typeof import('engine');
