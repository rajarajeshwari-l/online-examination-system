import {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger
} from "./chunk-KCRHROM7.js";
import "./chunk-A2LTXZUF.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-RIJWH26N.js";
import "./chunk-522MJSNA.js";
import "./chunk-QDEP4MIC.js";
import "./chunk-FATNUHVS.js";
import "./chunk-OT3NZKOA.js";
import "./chunk-C3ST2KBS.js";
import "./chunk-LIM4EW3R.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-K4EI3TOM.js";
import "./chunk-ELDMWKHP.js";
import "./chunk-46HAYV32.js";
import "./chunk-VENV3F3G.js";
import "./chunk-A265PAO4.js";
import "./chunk-QG5WRAU5.js";
import "./chunk-YDIZ6Y5A.js";
import "./chunk-O5NJVV5E.js";
import "./chunk-IUG5FPM5.js";
import "./chunk-556NW734.js";
import "./chunk-6U2ALXAW.js";
import "./chunk-5EG33CFQ.js";
import "./chunk-CBIOIWY7.js";
import "./chunk-3TGPQ4C4.js";
import "./chunk-IDAQPUI6.js";
import "./chunk-6V7IKQXN.js";
import "./chunk-ESAH7HWX.js";
import "./chunk-CDNLW5DB.js";
import "./chunk-3XIGQOJ7.js";
import "./chunk-RSS3ODKE.js";
import "./chunk-S35DAJRX.js";

// node_modules/@angular/material/fesm2022/select.mjs
var matSelectAnimations = {
  // Represents
  // trigger('transformPanel', [
  //   state(
  //     'void',
  //     style({
  //       opacity: 0,
  //       transform: 'scale(1, 0.8)',
  //     }),
  //   ),
  //   transition(
  //     'void => showing',
  //     animate(
  //       '120ms cubic-bezier(0, 0, 0.2, 1)',
  //       style({
  //         opacity: 1,
  //         transform: 'scale(1, 1)',
  //       }),
  //     ),
  //   ),
  //   transition('* => void', animate('100ms linear', style({opacity: 0}))),
  // ])
  /** This animation transforms the select's overlay panel on and off the page. */
  transformPanel: {
    type: 7,
    name: "transformPanel",
    definitions: [
      {
        type: 0,
        name: "void",
        styles: {
          type: 6,
          styles: { opacity: 0, transform: "scale(1, 0.8)" },
          offset: null
        }
      },
      {
        type: 1,
        expr: "void => showing",
        animation: {
          type: 4,
          styles: {
            type: 6,
            styles: { opacity: 1, transform: "scale(1, 1)" },
            offset: null
          },
          timings: "120ms cubic-bezier(0, 0, 0.2, 1)"
        },
        options: null
      },
      {
        type: 1,
        expr: "* => void",
        animation: {
          type: 4,
          styles: { type: 6, styles: { opacity: 0 }, offset: null },
          timings: "100ms linear"
        },
        options: null
      }
    ],
    options: {}
  }
};
export {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatOptgroup,
  MatOption,
  MatPrefix,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger,
  MatSuffix,
  matSelectAnimations
};
//# sourceMappingURL=@angular_material_select.js.map
