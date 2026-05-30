const availableFeatures = [
  //USER
  "create:user",
  "read:user",
  "read:user:self",
  "update:user",
  "update:user:others",

  //SESSION
  "create:session",
  "read:session",

  //ACTIVATION_TOKEN
  "read:activation_token",

  //MIGRATIONS
  "create:migrations",
  "read:migrations",

  //STATUS
  "read:status",
  "read:status:all",
]

export default availableFeatures;
