import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OrdersRoutingModule} from './orders-routing.module';
import {OrdersComponent} from './orders/orders.component';
import {OrderNewComponent} from './order-new/order-new.component';
import {MenuItemsComponent} from './menu-items/menu-items.component';
import {OrderEditComponent} from './order-edit/order-edit.component';
import {OrderDetailsComponent} from './order-details/order-details.component';

import {TableModule} from 'primeng/table';
import {InputTextModule} from "primeng/inputtext";

import {OrdersService} from './orders.service';
import {SharedModule} from "../shared/shared.module";
import {CalendarModule} from "primeng/calendar";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    OrdersComponent,
    OrderNewComponent,
    MenuItemsComponent,
    OrderEditComponent,
    OrderDetailsComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    SharedModule,
    OrdersRoutingModule,
    CalendarModule,
    DropdownModule,
    FormsModule
  ],
  providers: [OrdersService]
})
export class OrdersModule { }
