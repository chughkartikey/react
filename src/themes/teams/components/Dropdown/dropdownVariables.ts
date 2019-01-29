import { PxToRemFunc } from '../../../types'

export interface DropdownVariables {
  backgroundColor: string
  borderBottom: string
  borderColor: string
  borderColorFocus: string
  borderRadius: string
  borderRadiusFocus: string
  color: string
  comboboxPaddingButton: string
  comboboxPaddingInput: string
  comboboxFlexBasis: string
  listBackgroundColor: string
  listItemBackgroundColor: string
  listItemBackgroundColorActive: string
  listItemColorActive: string
  listMaxHeight: string
  toggleIndicatorSize: string
  width: string
}

export default (siteVars, pxToRem: PxToRemFunc): DropdownVariables => {
  const [_2px_asRem, _3px_asRem, _6px_asRem, _12px_asRem] = [2, 3, 6, 12].map(v => pxToRem(v))

  return {
    backgroundColor: siteVars.gray10,
    borderRadius: _3px_asRem,
    borderBottom: `${_2px_asRem} solid transparent`,
    borderColor: 'transparent',
    borderColorFocus: siteVars.brand,
    borderRadiusFocus: `${_3px_asRem} ${_3px_asRem} ${_2px_asRem} ${_2px_asRem}`,
    color: siteVars.bodyColor,
    comboboxPaddingButton: `0 ${_12px_asRem}`,
    comboboxPaddingInput: `${_6px_asRem} ${_12px_asRem}`,
    comboboxFlexBasis: '50px',
    listBackgroundColor: siteVars.white,
    listItemBackgroundColor: siteVars.white,
    listItemBackgroundColorActive: siteVars.brand,
    listItemColorActive: siteVars.white,
    listMaxHeight: '20rem',
    toggleIndicatorSize: pxToRem(32),
    width: pxToRem(356),
  }
}
