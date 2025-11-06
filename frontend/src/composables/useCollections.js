import { useLocalStorage } from './useLocalStorage.js'

export function useCollections() {
  const collectionsStorage = useLocalStorage('fontPreviewer_collections', [])
  
  function getCollections() {
    return collectionsStorage.get()
  }
  
  function saveCollection(name, fonts) {
    const collections = getCollections()
    const newCollection = {
      id: Date.now().toString(),
      name,
      fonts,
      createdAt: new Date().toISOString()
    }
    collections.push(newCollection)
    collectionsStorage.set(collections)
    return newCollection
  }
  
  function deleteCollection(id) {
    const collections = getCollections()
    const filtered = collections.filter(c => c.id !== id)
    collectionsStorage.set(filtered)
  }
  
  function updateCollection(id, updates) {
    const collections = getCollections()
    const index = collections.findIndex(c => c.id === id)
    if (index !== -1) {
      collections[index] = { ...collections[index], ...updates }
      collectionsStorage.set(collections)
    }
  }
  
  return {
    getCollections,
    saveCollection,
    deleteCollection,
    updateCollection
  }
}

