import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlsPanel } from './controls-panel';

describe('ControlsPanel', () => {
  let component: ControlsPanel;
  let fixture: ComponentFixture<ControlsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlsPanel);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pattern', 'flowing-hills');
    fixture.componentRef.setInput('paletteIndex', 0);
    fixture.componentRef.setInput('darkMode', true);
    fixture.componentRef.setInput('device', 'desktop');
    fixture.componentRef.setInput('linkCopied', false);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
