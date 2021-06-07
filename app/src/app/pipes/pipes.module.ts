import { NgModule } from '@angular/core';
import { CurrencyGlobalPipe } from './currency-global';
import { DateGlobalPipe } from './date-global';
@NgModule({
	declarations: [
    CurrencyGlobalPipe,
    DateGlobalPipe,
	],
	imports: [],
	exports: [
    CurrencyGlobalPipe,
    DateGlobalPipe,
	]
})
export class PipesModule {}
