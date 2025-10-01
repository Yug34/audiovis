# Panning Visualization Effect

## How the Panning Works

The circular frequency domain visualization now includes a panning effect that moves the center of the circle around the canvas over time.

### Key Components:

1. **Pan Speed**: Controls how fast the center moves (0.0001 to 0.01)
2. **Pan Radius**: Controls how far from center the circle can move (0% to 50% of canvas size)
3. **Orbital Motion**: Uses different speeds for X and Y axes to create elliptical motion

### Mathematical Implementation:

```
centerX = WIDTH/2 + cos(frameCount * panSpeed) * maxPanRadius
centerY = HEIGHT/2 + sin(frameCount * panSpeed * 0.7) * maxPanRadius * 0.8
```

### Visual Representation:

```
Canvas Layout:
┌─────────────────────────────────────┐
│                                     │
│        ●                            │  ← Circle moves in
│                                     │    elliptical orbit
│                                     │
│              ●                      │
│                                     │
│                                     │
│                     ●               │
│                                     │
│                                     │
│        ●                            │
│                                     │
└─────────────────────────────────────┘

Static Center:    Panning Center:
    ●                    ●
   /|\                  /|\
  / | \                / | \
 /  |  \              /  |  \
●───┼───●            ●───┼───●
 \  |  /              \  |  /
  \ | /                \ | /
   \|/                  \|/
    ●                    ●
```

### Preset Configurations:

- **Default**: Gentle movement (panSpeed: 0.002, panRadius: 0.15)
- **Fast Trail**: Quick orbiting (panSpeed: 0.005, panRadius: 0.2)
- **Slow Trail**: Slow drift (panSpeed: 0.001, panRadius: 0.1)
- **Colorful**: Medium movement (panSpeed: 0.003, panRadius: 0.25)
- **Orbiting**: Fast elliptical motion (panSpeed: 0.008, panRadius: 0.3)

### Real-time Controls:

- **Pan Speed Slider**: Adjusts orbital velocity
- **Pan Distance Slider**: Controls maximum distance from center
- **Live Updates**: Changes apply immediately to running visualization
