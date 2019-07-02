import * as customPropTypes from '@stardust-ui/react-proptypes'
import * as _ from 'lodash'
import * as PropTypes from 'prop-types'
import * as React from 'react'

import {
  childrenExist,
  UIComponent,
  commonPropTypes,
  rtlTextContainer,
  applyAccessibilityKeyHandlers,
  renderComponent as getStardust,
} from '../../lib'
import ChatItem from './ChatItem'
import ChatMessage from './ChatMessage'
import { WithAsProp, ShorthandValue, withSafeTypeForAs } from '../../types'
import { Accessibility } from '../../lib/accessibility/types'
import { chatBehavior } from '../../lib/accessibility'
import { UIComponentProps, ChildrenComponentProps } from '../../lib/commonPropInterfaces'
import { FocusZone } from '../../lib/accessibility/FocusZone'

export interface ChatSlotClassNames {
  item: string
}

export interface ChatProps extends UIComponentProps, ChildrenComponentProps {
  /**
   * Accessibility behavior if overridden by the user.
   * @default chatBehavior
   * */
  accessibility?: Accessibility

  /** Shorthand array of the items inside the chat. */
  items?: ShorthandValue[]
}

class Chat extends UIComponent<WithAsProp<ChatProps>, any> {
  static displayName = 'Chat'

  static className = 'ui-chat'

  static slotClassNames: ChatSlotClassNames = {
    item: `${Chat.className}__item`,
  }

  static propTypes = {
    ...commonPropTypes.createCommon({
      content: false,
    }),
    items: PropTypes.arrayOf(customPropTypes.itemShorthand),
  }

  static defaultProps = {
    accessibility: chatBehavior,
    as: 'ul',
  }

  static Item = ChatItem
  static Message = ChatMessage

  focusZoneRef = React.createRef<FocusZone>()

  actionHandlers = {
    focus: () => this.focusZoneRef.current && this.focusZoneRef.current.focus(),
  }

  renderComponent() {
    const { children, items } = this.props
    const { wrap, ElementType, classes, accessibility, unhandledProps } = getStardust({
      className: Chat.className,
      displayName: Chat.displayName,
      handledProps: Chat.handledProps,
      props: this.props,
      state: this.state,
      actionHandlers: this.actionHandlers,
      focusZoneRef: this.focusZoneRef,
      context: this.context,
    })

    return wrap(
      <ElementType
        className={classes.root}
        {...accessibility.attributes.root}
        {...rtlTextContainer.getAttributes({ forElements: [children] })}
        {...unhandledProps}
        {...applyAccessibilityKeyHandlers(accessibility.keyHandlers.root, unhandledProps)}
      >
        {childrenExist(children)
          ? children
          : _.map(items, item =>
              ChatItem.create(item, { defaultProps: { className: Chat.slotClassNames.item } }),
            )}
      </ElementType>,
    )
  }
}

/**
 * A Chat displays messages between users.
 */
export default withSafeTypeForAs<typeof Chat, ChatProps, 'ul'>(Chat)
