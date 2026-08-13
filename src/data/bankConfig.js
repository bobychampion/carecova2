const bankConfig = {
  gtbank: {
    id: 'gtbank',
    name: 'GTBank',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your GTBank Details Ready',
    credentialDescription:
      'Mono will ask you to authenticate using your GTBank internet banking or mobile banking credentials.',
    instructions: [
      'Have your GTBank internet or mobile banking username and password ready.',
      'Keep your phone nearby — GTBank may send an OTP for additional verification.',
      'Make sure your banking account is active and not locked.',
    ],
    recoveryHint:
      'To recover your GTBank login credentials, visit the GTBank internet banking portal or open the GTWorld app and use the "Forgot Password" option.',
  },

  access: {
    id: 'access',
    name: 'Access Bank',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your Access Bank Details Ready',
    credentialDescription:
      'Mono will ask you to authenticate using your Access Bank digital banking credentials.',
    instructions: [
      'Have your Access Bank internet banking or AccessMore app login details ready.',
      'Keep your phone nearby for any OTP verification.',
      'Make sure your banking account is active.',
    ],
    recoveryHint:
      'To recover your Access Bank login, open the AccessMore app or visit the Access Bank internet banking portal and select "Forgot Password."',
  },

  standardchartered: {
    id: 'standardchartered',
    name: 'Standard Chartered',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your Standard Chartered Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Standard Chartered account.',
    instructions: [
      'Have your Standard Chartered digital banking login details ready.',
      'Keep your phone nearby for any additional verification steps.',
      'Make sure your banking account is active.',
    ],
    recoveryHint:
      'To recover your Standard Chartered login, visit the SC Mobile app or internet banking portal and use the account recovery option.',
  },

  stanbic: {
    id: 'stanbic',
    name: 'Stanbic IBTC Bank',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your Stanbic IBTC Details Ready',
    credentialDescription:
      'Mono will ask you to authenticate using your Stanbic IBTC digital banking credentials.',
    instructions: [
      'Have your Stanbic IBTC internet banking or mobile app login details ready.',
      'Keep your phone nearby for OTP verification.',
      'Make sure your banking account is active.',
    ],
    recoveryHint:
      'To recover your Stanbic IBTC login, open the Stanbic IBTC app or visit the internet banking portal and select "Forgot Password."',
  },

  firstbank: {
    id: 'firstbank',
    name: 'First Bank',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your First Bank Details Ready',
    credentialDescription:
      'Mono will ask you to authenticate using your First Bank internet banking or FirstMobile credentials.',
    instructions: [
      'Have your First Bank internet banking username and password ready.',
      'Keep your phone nearby — First Bank may send an OTP to your registered number.',
      'Make sure your banking account is active and not locked.',
    ],
    recoveryHint:
      'To recover your First Bank login, open the FirstMobile app or visit the First Bank internet banking portal and use the "Forgot Password" option.',
  },

  fcmb: {
    id: 'fcmb',
    name: 'FCMB',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your FCMB Details Ready',
    credentialDescription:
      'Mono will ask you to authenticate using your FCMB digital banking credentials.',
    instructions: [
      'Have your FCMB internet banking or FCMB Mobile app login details ready.',
      'Keep your phone nearby for OTP verification.',
      'Make sure your banking account is active.',
    ],
    recoveryHint:
      'To recover your FCMB login, open the FCMB Mobile app or visit the FCMB internet banking portal and select "Forgot Password."',
  },

  zenith: {
    id: 'zenith',
    name: 'Zenith Bank',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your Zenith Bank Details Ready',
    credentialDescription:
      'Mono will ask you to authenticate using your Zenith Bank internet banking credentials.',
    instructions: [
      'Have your Zenith Bank internet banking username and password ready.',
      'Keep your phone nearby for OTP verification.',
      'Make sure your banking account is active and not locked.',
    ],
    recoveryHint:
      'To recover your Zenith Bank login, visit the Zenith Bank internet banking portal or the ZenithDirect app and use the "Forgot Password" option.',
  },

  fidelity: {
    id: 'fidelity',
    name: 'Fidelity Bank',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your Fidelity Bank Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Fidelity Bank account.',
    instructions: [
      'Have your Fidelity Bank internet banking or mobile app login details ready.',
      'Keep your phone nearby for any additional verification steps.',
      'Make sure your banking account is active.',
    ],
    recoveryHint:
      'To recover your Fidelity Bank login, open the Fidelity Mobile app or visit the Fidelity Bank internet banking portal and select "Forgot Password."',
  },

  union: {
    id: 'union',
    name: 'Union Bank of Nigeria',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your Union Bank Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Union Bank account.',
    instructions: [
      'Have your Union Bank internet banking or UnionMobile app login details ready.',
      'Keep your phone nearby for OTP verification.',
      'Make sure your banking account is active.',
    ],
    recoveryHint:
      'To recover your Union Bank login, open the UnionMobile app or visit the Union Bank internet banking portal and use the account recovery option.',
  },

  sterling: {
    id: 'sterling',
    name: 'Sterling Bank',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your Sterling Bank Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Sterling Bank account.',
    instructions: [
      'Have your Sterling Bank internet banking or Specta app login details ready.',
      'Keep your phone nearby for OTP verification.',
      'Make sure your banking account is active.',
    ],
    recoveryHint:
      'To recover your Sterling Bank login, open the Sterling app or visit the Sterling Bank internet banking portal and use the account recovery option.',
  },

  alat: {
    id: 'alat',
    name: 'ALAT by WEMA',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your ALAT Details Ready',
    credentialDescription:
      'Mono will ask you to authenticate using your ALAT by WEMA app credentials.',
    instructions: [
      'Have your ALAT app login details ready.',
      'Keep your phone nearby for any additional verification steps.',
      'Make sure your ALAT account is active.',
    ],
    recoveryHint:
      'To recover your ALAT account, open the ALAT app and use the "Forgot Password" or account recovery option.',
  },

  ecobank: {
    id: 'ecobank',
    name: 'Ecobank Nigeria',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your Ecobank Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Ecobank account.',
    instructions: [
      'Have your Ecobank internet banking or EcobankPay app login details ready.',
      'Keep your phone nearby for OTP verification.',
      'Make sure your banking account is active.',
    ],
    recoveryHint:
      'To recover your Ecobank login, open the Ecobank Mobile app or visit the Ecobank internet banking portal and use the account recovery option.',
  },

  keystone: {
    id: 'keystone',
    name: 'Keystone Bank',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your Keystone Bank Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Keystone Bank account.',
    instructions: [
      'Have your Keystone Bank internet banking or mobile app login details ready.',
      'Keep your phone nearby for OTP verification.',
      'Make sure your banking account is active.',
    ],
    recoveryHint:
      'To recover your Keystone Bank login, open the Keystone Mobile app or visit the Keystone Bank internet banking portal and use the account recovery option.',
  },

  providus: {
    id: 'providus',
    name: 'Providus Bank',
    category: 'Commercial Bank',
    preparationTitle: 'Get Your Providus Bank Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Providus Bank account.',
    instructions: [
      'Have your Providus Bank internet banking or mobile app login details ready.',
      'Keep your phone nearby for OTP verification.',
      'Make sure your banking account is active.',
    ],
    recoveryHint:
      'To recover your Providus Bank login, contact Providus Bank customer service or use the password recovery option on their internet banking portal.',
  },

  kuda: {
    id: 'kuda',
    name: 'Kuda Bank',
    category: 'Digital Bank',
    preparationTitle: 'Get Your Kuda Details Ready',
    credentialDescription:
      'Mono will ask you to authenticate using your Kuda app credentials.',
    instructions: [
      'Have your Kuda app login details ready (email and password).',
      'Keep your phone nearby — Kuda may require in-app approval.',
      'Make sure your Kuda account is active.',
    ],
    recoveryHint:
      'To recover your Kuda account, open the Kuda app and use the "Forgot Password" option.',
  },

  vulte: {
    id: 'vulte',
    name: 'VULTe Digital Bank',
    category: 'Digital Bank',
    preparationTitle: 'Get Your VULTe Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your VULTe account.',
    instructions: [
      'Have your VULTe app login details ready.',
      'Keep your phone nearby for any additional verification steps.',
      'Make sure your VULTe account is active.',
    ],
    recoveryHint:
      'To recover your VULTe account, open the VULTe app and use the account recovery option.',
  },

  opay: {
    id: 'opay',
    name: 'OPay',
    category: 'Digital Bank',
    preparationTitle: 'Get Your OPay Details Ready',
    credentialDescription:
      'Mono will ask you to authenticate using your OPay app credentials.',
    instructions: [
      'Have your OPay app login details ready (phone number and PIN/password).',
      'Keep your phone nearby for OTP verification.',
      'Make sure your OPay account is active.',
    ],
    recoveryHint:
      'To recover your OPay account, open the OPay app and use the "Forgot Password" or account recovery option.',
  },

  piggyvest: {
    id: 'piggyvest',
    name: 'Piggyvest',
    category: 'Financial Platform',
    preparationTitle: 'Get Your Piggyvest Details Ready',
    credentialDescription:
      'Mono will ask you to authenticate using your Piggyvest account credentials.',
    instructions: [
      'Have your Piggyvest login details ready (email and password).',
      'Keep your phone nearby for any additional verification steps.',
      'Make sure your Piggyvest account is active.',
    ],
    recoveryHint:
      'To recover your Piggyvest account, open the Piggyvest app or website and use the "Forgot Password" option.',
  },

  cowrywise: {
    id: 'cowrywise',
    name: 'Cowrywise',
    category: 'Financial Platform',
    preparationTitle: 'Get Your Cowrywise Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Cowrywise account.',
    instructions: [
      'Have your Cowrywise app login details ready.',
      'Keep your phone nearby for any additional verification steps.',
      'Make sure your Cowrywise account is active.',
    ],
    recoveryHint:
      'To recover your Cowrywise account, open the Cowrywise app and use the "Forgot Password" option.',
  },

  chaka: {
    id: 'chaka',
    name: 'Chaka',
    category: 'Financial Platform',
    preparationTitle: 'Get Your Chaka Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Chaka account.',
    instructions: [
      'Have your Chaka app login details ready.',
      'Keep your phone nearby for any additional verification steps.',
      'Make sure your Chaka account is active.',
    ],
    recoveryHint:
      'To recover your Chaka account, open the Chaka app or website and use the account recovery option.',
  },

  risevest: {
    id: 'risevest',
    name: 'Risevest',
    category: 'Financial Platform',
    preparationTitle: 'Get Your Risevest Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Risevest account.',
    instructions: [
      'Have your Risevest app login details ready.',
      'Keep your phone nearby for any additional verification steps.',
      'Make sure your Risevest account is active.',
    ],
    recoveryHint:
      'To recover your Risevest account, open the Risevest app and use the "Forgot Password" option.',
  },

  trove: {
    id: 'trove',
    name: 'Trove',
    category: 'Financial Platform',
    preparationTitle: 'Get Your Trove Details Ready',
    credentialDescription:
      'Mono will show you the authentication options available for your Trove account.',
    instructions: [
      'Have your Trove app login details ready.',
      'Keep your phone nearby for any additional verification steps.',
      'Make sure your Trove account is active.',
    ],
    recoveryHint:
      'To recover your Trove account, open the Trove app and use the account recovery option.',
  },
}

export const bankCategories = [
  {
    label: 'Commercial Banks',
    banks: [
      'gtbank', 'access', 'standardchartered', 'stanbic', 'firstbank',
      'fcmb', 'zenith', 'fidelity', 'union', 'sterling', 'alat',
      'ecobank', 'keystone', 'providus',
    ],
  },
  {
    label: 'Digital Banks',
    banks: ['kuda', 'vulte', 'opay'],
  },
  {
    label: 'Financial Platforms',
    banks: ['piggyvest', 'cowrywise', 'chaka', 'risevest', 'trove'],
  },
]

export const allBanks = Object.values(bankConfig)

export default bankConfig
