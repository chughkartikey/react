import { Accessibility, FocusZoneMode } from '../../types'
import { IS_FOCUSABLE_ATTRIBUTE } from '../../FocusZone/focusUtilities'
import * as keyboardKey from 'keyboard-key'
import { FocusZoneTabbableElements, FocusZoneDirection } from '../../FocusZone'

/**
 * @description
 * Sets the message to be a focusable element.
 * Adds a vertical circular focus zone navigation where a user navigates using a Tab key.
 * Adds a key action which prevents up and down arrow keys from navigating in FocusZone, we only want a Tab key to navigate.
 * Adds an escape key action which focuses the chat message, i.e., moves key handling from inside a message back to the chat list.
 *
 * @specification
 * Embeds component into FocusZone.
 * Provides arrow key navigation in vertical direction.
 * Keyboard navigation is circular.
 * Focus is moved within the focusable children of the component using TAB key.
 */
const chatMessageBehavior: Accessibility = () => ({
  attributes: {
    root: {
      [IS_FOCUSABLE_ATTRIBUTE]: true,
    },
  },
  focusZone: {
    mode: FocusZoneMode.Embed,
    props: {
      handleTabKey: FocusZoneTabbableElements.all,
      isCircularNavigation: true,
      direction: FocusZoneDirection.vertical,
    },
  },
  keyActions: {
    root: {
      // prevents default FocusZone behavior, in this case, prevents using arrow keys as navigation (we only want a Tab key to navigate)
      preventDefault: {
        keyCombinations: [{ keyCode: keyboardKey.ArrowUp }, { keyCode: keyboardKey.ArrowDown }],
      },
      focus: {
        keyCombinations: [{ keyCode: keyboardKey.Escape }],
      },
    },
  },
})

export default chatMessageBehavior
