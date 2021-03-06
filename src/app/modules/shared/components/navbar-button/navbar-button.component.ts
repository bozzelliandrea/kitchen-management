import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'navbar-button',
  template: `
    <button (click)="onClick.emit()"
            [ngClass]="active ? 'active' : ''"
            [pTooltip]="title"
            [showDelay]="500"
            tooltipPosition="top">
      <i *ngIf="!badged" class="pi {{icon}}"></i>
      <i *ngIf="badged" class="pi {{icon}}" pBadge [value]="' '"></i>
    </button>
  `,
  styleUrls: ['navbar-button.component.scss']
})
export class NavbarButtonComponent {

  @Input() public icon!: string;
  @Input() public active: boolean = false;
  @Input() public badged: boolean = false;
  @Input() public badgeCounter?: number | null;
  @Input() public title!: string;

  @Output() public onClick: EventEmitter<void> = new EventEmitter<void>(true);
}
