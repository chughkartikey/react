import { Accessibility } from '../../types'

const sliderBehavior: Accessibility<SliderBehaviorProps> = props => ({
  attributes: {
    root: {
      'aria-disabled': props.disabled,
    },
    input: {
      'aria-orientation': props.vertical ? 'vertical' : 'horizontal',
      'aria-valuemin': props.min,
      'aria-valuemax': props.max,
      'aria-valuenow': props.value,
      'aria-valuetext': props.getA11yValueMessageOnChange(props),
    },
  },
})

export default sliderBehavior

type SliderBehaviorProps = {
  disabled?: boolean
  min?: number
  max?: number
  value?: number
  vertical?: boolean
  getA11yValueMessageOnChange?: (props: SliderBehaviorProps) => string
}
