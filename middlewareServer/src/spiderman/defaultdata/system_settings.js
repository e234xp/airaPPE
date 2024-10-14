module.exports = {
  system_password: '123456',
  langurage: 'tw',
  network: {
    type: 'dhcp',
    ip_address: '',
    mask: '',
    gateway: '',
    nameserver: '',
  },
  airaface: {
    host: '',
    port: 443,
    client_id: '',
  },
  db: {
    verified_maintain_duration: 5184000000,
    non_verified_maintain_duration: 604800000,
    maintain_disk_space_in_gb: 50,
  },
  smtp: {
    secure: true,
    from: 'airaFaceService',
    user: '',
    pass: '',
    host: 'smtp.gmail.com',
    port: 587,
  },
};
