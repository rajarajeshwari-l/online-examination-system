import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-K4EI3TOM.js";
import {
  MatCommonModule,
  ObserversModule
} from "./chunk-QG5WRAU5.js";
import {
  NgModule,
  setClassMetadata,
  ɵɵdefineNgModule
} from "./chunk-CDNLW5DB.js";
import {
  ɵɵdefineInjector
} from "./chunk-3XIGQOJ7.js";

// node_modules/@angular/material/fesm2022/form-field-module.mjs
var MatFormFieldModule = class _MatFormFieldModule {
  static ɵfac = function MatFormFieldModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatFormFieldModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _MatFormFieldModule,
    imports: [MatCommonModule, ObserversModule, MatFormField, MatLabel, MatError, MatHint, MatPrefix, MatSuffix],
    exports: [MatFormField, MatLabel, MatHint, MatError, MatPrefix, MatSuffix, MatCommonModule]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [MatCommonModule, ObserversModule, MatFormField, MatCommonModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatFormFieldModule, [{
    type: NgModule,
    args: [{
      imports: [MatCommonModule, ObserversModule, MatFormField, MatLabel, MatError, MatHint, MatPrefix, MatSuffix],
      exports: [MatFormField, MatLabel, MatHint, MatError, MatPrefix, MatSuffix, MatCommonModule]
    }]
  }], null, null);
})();

export {
  MatFormFieldModule
};
//# sourceMappingURL=chunk-C3ST2KBS.js.map
