import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonCardView } from './common-card-view';

describe('CommonCardView', () => {
  let component: CommonCardView;
  let fixture: ComponentFixture<CommonCardView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonCardView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonCardView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
