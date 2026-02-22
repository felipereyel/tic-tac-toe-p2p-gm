<template>
  <div class="join-game">
    <template v-if="isConnecting">
      <div class="waiting">
        <h2>Connecting...</h2>
        <p>Please wait while we connect to the game.</p>
      </div>
    </template>
    <template v-else-if="isWaiting">
      <div class="waiting">
        <h2>Waiting on GM Approval</h2>
        <p>Your request has been sent to the Game Master.</p>
        <p class="subtext">Game Code: {{ gameCode }}</p>
      </div>
    </template>
    <template v-else>
      <h1>Join Game</h1>

      <form @submit.prevent="handleSubmit" class="join-form">
        <div class="form-group">
          <label for="gameCode">Game Code</label>
          <input
            id="gameCode"
            v-model="codeInput"
            type="text"
            placeholder="Enter 6-letter code"
            maxlength="6"
            required
          />
        </div>

        <div class="form-group">
          <label for="gamertag">Your Gamertag</label>
          <input
            id="gamertag"
            v-model="tagInput"
            type="text"
            placeholder="Enter your name"
            maxlength="20"
            required
          />
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="form-actions">
          <button type="submit" :disabled="!isValid" class="btn-join">Join</button>
          <button type="button" @click="$emit('back')" class="btn-back">Back</button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getSavedGamertag, setSavedGamertag } from '@/utils/storage'

defineProps<{
  isConnecting?: boolean
  isWaiting?: boolean
  gameCode?: string
}>()

const emit = defineEmits<{
  join: [code: string, gamertag: string]
  back: []
}>()

const codeInput = ref('')
const tagInput = ref('')
const error = ref('')

onMounted(() => {
  tagInput.value = getSavedGamertag()
})

const isValid = computed(() => {
  return codeInput.value.length === 6 && tagInput.value.trim().length > 0
})

function handleSubmit() {
  if (!isValid.value) return
  setSavedGamertag(tagInput.value.trim())
  emit('join', codeInput.value.toUpperCase(), tagInput.value.trim())
}
</script>

<style scoped>
.join-game {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
}

input {
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 6px;
}

input:focus {
  outline: none;
  border-color: var(--color-primary, #42b883);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-join,
.btn-back {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-join {
  background-color: #42b883;
  color: white;
}

.btn-join:disabled {
  background-color: #a0dcc4;
  cursor: not-allowed;
}

.btn-back {
  background-color: #95a5a6;
  color: white;
}

.error {
  color: #e74c3c;
  text-align: center;
}

.waiting {
  text-align: center;
  padding: 2rem;
}

.waiting h2 {
  color: #42b883;
  margin-bottom: 1rem;
}

.waiting p {
  color: var(--color-text, #666);
  margin-bottom: 0.5rem;
}

.waiting .subtext {
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
