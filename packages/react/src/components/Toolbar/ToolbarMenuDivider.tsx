import * as React from 'react'
import {
  ChildrenComponentProps,
  ContentComponentProps,
  createShorthandFactory,
  UIComponentProps,
  UIComponent,
  commonPropTypes,
} from '../../lib'
import { Accessibility } from '../../lib/accessibility/types'
import { WithAsProp, withSafeTypeForAs } from '../../types'

export interface ToolbarMenuDividerProps
  extends UIComponentProps,
    ChildrenComponentProps,
    ContentComponentProps {
  /**
   * Accessibility behavior if overridden by the user.
   */
  accessibility?: Accessibility
}

class ToolbarMenuDivider extends UIComponent<WithAsProp<ToolbarMenuDividerProps>> {
  static displayName = 'ToolbarMenuDivider'

  static create: Function

  static className = 'ui-toolbar__menudivider'

  static propTypes = {
    ...commonPropTypes.createCommon(),
  }

  static defaultProps = {
    as: 'li',
  }

  renderComponent({ ElementType, classes, unhandledProps, accessibility }) {
    return (
      <ElementType
        {...accessibility.attributes.root}
        {...unhandledProps}
        className={classes.root}
      />
    )
  }
}

ToolbarMenuDivider.create = createShorthandFactory({
  Component: ToolbarMenuDivider,
  mappedProp: 'content',
})

/**
 * Toolbar menu divider.
 * Adds visual non-selectable separator between items.
 */
export default withSafeTypeForAs<typeof ToolbarMenuDivider, ToolbarMenuDividerProps, 'li'>(
  ToolbarMenuDivider,
)
