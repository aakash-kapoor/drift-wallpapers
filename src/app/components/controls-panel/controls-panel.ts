import { Component, input, output } from '@angular/core';
import { Pattern, PATTERNS, PATTERN_LABELS, Device } from '../../core/wallpaper-engine.service';
import { PALETTES } from '../../core/palette.data';

@Component({
  selector: 'app-controls-panel',
  imports: [],
  templateUrl: './controls-panel.html',
  styleUrl: './controls-panel.css',
})
export class ControlsPanel {
  pattern = input.required<Pattern>();
  paletteIndex = input.required<number>();
  darkMode = input.required<boolean>();
  device = input.required<Device>();
  linkCopied = input.required<boolean>();
  
  patternChange = output<Pattern>();
  paletteIndexChange = output<number>();
  darkModeChange = output<boolean>();
  deviceSelect = output<Device>();
  generate = output<void>();
  download = output<void>();
  copyLink = output<void>();

  readonly patterns = PATTERNS;
  readonly patternLabels = PATTERN_LABELS;
  readonly palettes = PALETTES;
}