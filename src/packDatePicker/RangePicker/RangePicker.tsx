import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { Row, Col } from "antd";
import moment from "moment";
// 声明文件
import { Moment } from "moment/moment.d";
import { RangePickerValue } from "./RangePicker.d";
// 组件引用
import SingleDatePicker, {
  ValueStatus,
  ValueType,
  PickerValue,
} from "../SingleDatePicker";

const LayoutCol = styled(Col)`
  position: relative;
`;

const LayoutDiv = styled.div`
  position: absolute;
  left: 50%;
`;

const RelationSpan = styled.div`
  position: relative;
  right: 50%;
`;

// 声明组件Props类型
interface Props {
  disabledDate?: (
    currentDate: Moment | undefined,
    valueStatus?: ValueStatus
  ) => boolean;
  selectTodayAfter?: boolean;
  valueStatus?: ValueStatus;
  format?: string | string[];
  valueType?: ValueType;
  onChange?: (value: RangePickerValue) => void;
  showToday?: boolean;
  value?: RangePickerValue;
}

const RangePicker = (props: Props) => {
  const { showToday, onChange, value, selectTodayAfter, disabledDate } = props;

  const [RangeValue, setRangeValue] = useState<RangePickerValue>({
    [ValueStatus.Start]: undefined,
    [ValueStatus.End]: undefined,
  });

  // 时间变化回调
  const rangeChange = useCallback(
    (value?: PickerValue, valueStatus?: ValueStatus) => {
      if (onChange) {
        onChange({
          ...RangeValue,
          ...(valueStatus ? { [valueStatus]: value } : {}),
        });
      } else {
        setRangeValue({
          ...RangeValue,
          ...(valueStatus ? { [valueStatus]: value } : {}),
        });
      }
    },
    [onChange, RangeValue]
  );

  // 不可选择时间回调
  const rangeDisabledDate = useCallback(
    (currentDate: Moment | undefined, valueStatus?: ValueStatus) => {
      // 上层 不可选择时间段 回调
      if (disabledDate) {
        return disabledDate(currentDate, valueStatus);
      }

      const startTime = RangeValue[ValueStatus.Start];
      const endTime = RangeValue[ValueStatus.End];

      switch (valueStatus) {
        case ValueStatus.Start:
          if (selectTodayAfter) {
            if (currentDate && !endTime) {
              return currentDate.isBefore(moment());
            }
            if (currentDate && endTime) {
              return (
                currentDate.isBefore(moment()) || currentDate.isAfter(endTime)
              );
            }
            return false;
          }
          return false;
        case ValueStatus.End:
          if (selectTodayAfter) {
            if (currentDate && !startTime) {
              return currentDate.isBefore(moment());
            }
            if (currentDate && startTime) {
              return currentDate.isBefore(startTime);
            }
            return false;
          }
          return false;
        default:
      }
      return true;
    },
    [RangeValue, disabledDate]
  );

  // 上层porps变化
  useEffect(
    () => {
      if (value !== undefined) {
        setRangeValue(value);
      } else {
        setRangeValue({
          [ValueStatus.Start]: undefined,
          [ValueStatus.End]: undefined,
        });
      }
    },
    [value]
  );

  return (
    <Row gutter={24}>
      <LayoutCol span={12}>
        <SingleDatePicker
          value={RangeValue[ValueStatus.Start]}
          valueStatus={ValueStatus.Start}
          disabledDate={rangeDisabledDate}
          onChange={rangeChange}
          showToday={showToday}
          valueType={ValueType.TimeStamp}
          defaultPickerValue={
            RangeValue[ValueStatus.Start]
              ? moment(RangeValue[ValueStatus.Start])
              : undefined
          }
        />
      </LayoutCol>
      <LayoutDiv>
        <RelationSpan>~</RelationSpan>
      </LayoutDiv>
      <Col span={12}>
        <SingleDatePicker
          value={RangeValue[ValueStatus.End]}
          valueStatus={ValueStatus.End}
          disabledDate={rangeDisabledDate}
          showToday={showToday}
          onChange={rangeChange}
          valueType={ValueType.TimeStamp}
          defaultPickerValue={
            RangeValue[ValueStatus.Start]
              ? moment(RangeValue[ValueStatus.Start])
              : undefined
          }
        />
      </Col>
    </Row>
  );
};

// class RangePicker extends Component<Props, State> {
//   constructor(props) {
//     super(props);
//     this.state = {
//       currentDate: moment(),
//       value: { [ValueStatus.Start]: undefined, [ValueStatus.End]: undefined }, // 内部维护 时间组件的值
//     };
//   }

//   static defaultProps = {
//     valueType: ValueType.TimeStamp,
//     format: "YYYY-MM-DD",
//     valueStatus: ValueStatus.Start,
//     selectTodayAfter: true,
//     showToday: true,
//   };

//   static getDerivedStateFromProps(props, state) {
//     const { value } = props;

//     if (value && (value[ValueStatus.Start] || value[ValueStatus.End])) {
//       return {
//         value: {
//           [ValueStatus.Start]: value[ValueStatus.Start],
//           [ValueStatus.End]: value[ValueStatus.End],
//         },
//       };
//     }
//     return {
//       value: { [ValueStatus.Start]: undefined, [ValueStatus.End]: undefined },
//     };
//   }

//   // 不可选择时间回调
//   disabledDate = (
//     currentDate: Moment | undefined,
//     valueStatus?: ValueStatus
//   ) => {
//     const { disabledDate, selectTodayAfter } = this.props;
//     // 上层 不可选择时间段 回调
//     if (disabledDate) {
//       return disabledDate(currentDate, valueStatus);
//     }

//     const { value, currentDate: compareDate } = this.state;
//     const startTime = value[ValueStatus.Start];
//     const endTime = value[ValueStatus.End];

//     switch (valueStatus) {
//       case ValueStatus.Start:
//         if (selectTodayAfter) {
//           if (currentDate && !endTime) {
//             return currentDate.isBefore(compareDate);
//           }
//           if (currentDate && endTime) {
//             return (
//               currentDate.isBefore(compareDate) || currentDate.isAfter(endTime)
//             );
//           }
//           return false;
//         }
//         return false;
//       case ValueStatus.End:
//         if (selectTodayAfter) {
//           if (currentDate && !startTime) {
//             return currentDate.isBefore(compareDate);
//           }
//           if (currentDate && startTime) {
//             return currentDate.isBefore(startTime);
//           }
//           return false;
//         }
//         return false;
//       default:
//     }
//     return true;
//   };

//   //  时间变化回调
//   onChange = (value?: PickerValue, valueStatus?: ValueStatus) => {
//     const { onChange } = this.props;
//     const { value: stateValue } = this.state;
//     if (onChange) {
//       onChange({
//         ...stateValue,
//         ...(valueStatus ? { [valueStatus]: value } : {}),
//       });
//     } else {
//       this.setState({
//         value: {
//           ...stateValue,
//           ...(valueStatus ? { [valueStatus]: value } : {}),
//         },
//       });
//     }
//   };

//   render() {
//     const { value } = this.state;
//     const startTime = value[ValueStatus.Start];
//     const endTime = value[ValueStatus.End];
//     const { showToday } = this.props;
//     return (
//       <Row gutter={24}>
//         <LayoutCol span={12}>
//           <SingleDatePicker
//             value={startTime}
//             valueStatus={ValueStatus.Start}
//             disabledDate={this.disabledDate}
//             onChange={this.onChange}
//             showToday={showToday}
//             valueType={ValueType.TimeStamp}
//             defaultPickerValue={startTime ? moment(startTime) : undefined}
//           />
//         </LayoutCol>
//         <LayoutDiv>
//           <RelationSpan>~</RelationSpan>
//         </LayoutDiv>
//         <Col span={12}>
//           <SingleDatePicker
//             value={endTime}
//             valueStatus={ValueStatus.End}
//             disabledDate={this.disabledDate}
//             showToday={showToday}
//             onChange={this.onChange}
//             valueType={ValueType.TimeStamp}
//             defaultPickerValue={startTime ? moment(startTime) : undefined}
//           />
//         </Col>
//       </Row>
//     );
//   }
// }

export default RangePicker;
