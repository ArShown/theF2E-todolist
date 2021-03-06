import React from 'react';
import handler from './handler';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

export default handler(({ storeData: onTime, changeHandler }) =>
  <FormGroup row>
    <FormControlLabel
      control={
        <Checkbox
          checked={!onTime}
          onChange={changeHandler(onTime)}
          color="primary"
        />
      }
      label="逾期繳交"
    />
  </FormGroup>
);
