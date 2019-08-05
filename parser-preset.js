module.exports = {
  parserOpts: {
      headerPattern: /^(\w+.{1,2}[^\x00-\xff])(?:\((.*)\))?: (.*)$/,
      headerCorrespondence: ['type', 'scope',  'subject']
  }
};

