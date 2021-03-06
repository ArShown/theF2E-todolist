import moment from 'moment';

/* type */
import { TASK_INSERT } from '~/storage/reducer';

/* action */
import { emit } from '~/core/action/effects';

/* component */
import { compose, withStyle, withDispatch } from '~/core/container';
import { withStateHandlers, withHandlers, withProps } from 'recompose';

/* helper */
import { merge } from 'ramda';
import { of, concat } from 'rxjs';

/* style */
import add from './add.scss';

const defaultFields = {
  modifyMode: false,
  completed: false,
  important: false,
  content: '',
  file: '',
  comment: '',
  deadline: {
    date: '',
    time: ''
  }
};

export const modifyManager = withStateHandlers(defaultFields, {
  updateOneField: () => (field, value) => ({ [field]: value }),
  updateAllField: preState => merge(preState)
});

export const modifyEvent = withHandlers(({ updateOneField }) => ({
  /* completed , important */
  toggleField: () => (field, value) => () => {
    updateOneField(field, !value);
  },
  /* content */
  setContent: () => e => {
    updateOneField('content', e.target.value);
  },
  /* others */
  setField: () => (field, value) => {
    updateOneField(field, value);
  }
}));

export const submitValid = withProps(({ content }) => ({
  isLegal: content.trim() !== ''
}));

export default compose(
  withDispatch,
  modifyManager,
  modifyEvent,
  withHandlers(({ dispatch, updateAllField }) => {
    let _inputEl;

    return {
      setInputEl: () => el => {
        _inputEl = el;
      },
      triggerHandler: ({ modifyMode, updateOneField }) => {
        const triggerStream = concat(
          of(() => updateOneField('modifyMode', true)),
          of(() => _inputEl.focus())
        );

        return () => {
          if (modifyMode) return false;
          triggerStream.subscribe(stream => stream());
        };
      },
      cancel: () => () => {
        updateAllField(defaultFields);
      },
      submit: ({
        completed,
        important,
        content,
        file,
        comment,
        deadline: {
          date,
          time
        }
      }) => {
        /* moment obj */
        const dateMoment = moment(date, 'YYYY/MM/DD');
        const timeMoment = moment(time, 'HH:mm');

        /* 寫入 deadline 格式 */
        const deadline = {
          date: dateMoment.isValid() ? dateMoment.format('YYYY/MM/DD') : '',
          time: timeMoment.isValid() ? timeMoment.format('HH:mm') : ''
        };

        /* 判斷是不是只有輸入時間，是的話日期填今天*/
        if (deadline.time !== '' && deadline.date === '')
          deadline.date = moment().format('YYYY/MM/DD');

        const submitStream = concat(
          of(() => dispatch(
            emit(TASK_INSERT, {
              completed,
              important,
              content,
              file,
              comment,
              deadline
            })
          )),
          of(() => updateAllField(defaultFields))
        );

        return () => {
          if (content.trim() !== '')
            submitStream.subscribe(stream => stream());
          return false;
        };
      }
    };
  }),
  submitValid,
  withStyle(add)
);
