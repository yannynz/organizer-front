import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryReturnComponent } from './delivery-return.component';

describe('DeliveryReturnComponent', () => {
  let component: DeliveryReturnComponent;
  let fixture: ComponentFixture<DeliveryReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeliveryReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
