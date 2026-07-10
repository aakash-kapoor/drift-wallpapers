import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasPreview } from './canvas-preview';

describe('CanvasPreview', () => {
  let component: CanvasPreview;
  let fixture: ComponentFixture<CanvasPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasPreview],
    }).compileComponents();

    fixture = TestBed.createComponent(CanvasPreview);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pattern', 'flowing-hills');
    fixture.componentRef.setInput('paletteIndex', 0);
    fixture.componentRef.setInput('seed', 12345);
    fixture.componentRef.setInput('darkMode', true);
    fixture.componentRef.setInput('device', 'desktop');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
