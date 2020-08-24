import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { SelectItemModel } from '../../models/select-item.model';

@Component({
  selector: 'app-select-multiple',
  templateUrl: './select-multiple.component.html',
  styleUrls: ['./select-multiple.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectMultipleComponent),
      multi: true
    }
  ]
})
export class SelectMultipleComponent implements ControlValueAccessor {

  @Input() set options(opts: SelectItemModel<string>[]) {
    if (opts) {
      this._options = opts;
      this.updateOptions(this.selectedSubject.value.map((option: SelectItemModel) => option.value));
    }
  }

  get options(): SelectItemModel<string>[] {
    return this._options;
  }

  selectedList$: Observable<SelectItemModel<string>[]>;

  selectedValues$: Observable<string[]>;

  unselectedList$: Observable<SelectItemModel<string>[]>;

  unselectedValues$: Observable<string[]>;

  private _options: SelectItemModel<string>[];
  private onChange: (_: string[]) => any;
  private onTouch: () => any;
  private readonly selectedSubject: BehaviorSubject<SelectItemModel[]>;
  private readonly unselectedSubject: BehaviorSubject<SelectItemModel[]>;

  constructor() {
    this.onChange = () => {
      // Empty by design.
    };
    this.onTouch = () => {
      // Empty by design.
    };
    this._options = [];
    this.selectedSubject = new BehaviorSubject([]);
    this.selectedList$ = this.selectedSubject.asObservable();
    this.selectedValues$ = this.selectedSubject.pipe(
      map((items: SelectItemModel[]) => items.map((item: SelectItemModel) => item.value)),
      debounceTime(200),
      tap((itemValues: string[]) => this.onChange(itemValues))
    );

    this.unselectedSubject = new BehaviorSubject([]);
    this.unselectedList$ = this.unselectedSubject.asObservable();
    this.unselectedValues$ = this.unselectedSubject.pipe(map((items: SelectItemModel[]) =>
      items.map((item: SelectItemModel) => item.value)));
  }

  select(itemsValues: string[]): void {
    const oldUnselectedItems: SelectItemModel[] = this.unselectedSubject.value;
    const unselectedItemsMap: Map<string, boolean> = new Map();

    itemsValues.forEach((itemValue: string) => unselectedItemsMap.set(itemValue, true));
    this.unselectedSubject.next(oldUnselectedItems.filter((item: SelectItemModel) => !unselectedItemsMap.get(item.value)));
    this.selectedSubject.next(
      [
        ...this.selectedSubject.value,
        ...oldUnselectedItems.filter((item: SelectItemModel) => unselectedItemsMap.get(item.value))
      ]
    );
  }

  deselect(itemsValues: string[]): void {
    const oldSelectedItems: SelectItemModel[] = this.selectedSubject.value;
    const selectedItemsMap: Map<string, boolean> = new Map();

    itemsValues.forEach((itemValue: string) => selectedItemsMap.set(itemValue, true));
    this.selectedSubject.next(oldSelectedItems.filter((item: SelectItemModel) => !selectedItemsMap.get(item.value)));
    this.unselectedSubject.next(
      [
        ...this.unselectedSubject.value,
        ...oldSelectedItems.filter((item: SelectItemModel) => selectedItemsMap.get(item.value))
      ]
    );
  }

  registerOnChange(fn: (_: string[]) => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this.onTouch = fn;
  }

  writeValue(optionsValues: string[]): void {
    this.updateOptions(optionsValues);
  }

  private updateOptions(optionsValues: string[]): void {
    const values: string[] = optionsValues || [];
    const optionsValueMap: Map<string, boolean> = new Map();
    values?.forEach((optionValue: string) => optionsValueMap.set(optionValue, true));

    const newSelectedList: SelectItemModel[] = [];
    const newUnselectedList: SelectItemModel[] = [];
    for (const option of this.options) {
      if (optionsValueMap.get(option.value)) {
        newSelectedList.push(option);
      } else {
        newUnselectedList.push(option);
      }
    }

    this.selectedSubject.next(newSelectedList);
    this.unselectedSubject.next(newUnselectedList);
  }

}
