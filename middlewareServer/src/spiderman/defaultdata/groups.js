const { uuid: uuidv4 } = require('uuidv4');

module.exports = [
  {
    uuid: uuidv4(),
    name: 'All Person',
    remarks: '',
    fixed: true,
    no_edit: true,
    create_date: Date.now(),
  },
  {
    uuid: uuidv4(),
    name: 'All Visitor',
    remarks: '',
    fixed: true,
    no_edit: true,
    create_date: Date.now(),
  },
];
