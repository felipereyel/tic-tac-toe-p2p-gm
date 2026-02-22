const STORAGE_KEY = 'p2p-tictactoe-gamertag'

export function getSavedGamertag(): string {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function setSavedGamertag(gamertag: string) {
  localStorage.setItem(STORAGE_KEY, gamertag)
}
