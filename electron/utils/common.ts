function getElectronEnv() {
  return process.env.NODE_ENV === 'development' ? 'dev' : (process.env.ELECTRON_ENV === 'test' ? 'test' : 'prod')
}

export {
  getElectronEnv
}
