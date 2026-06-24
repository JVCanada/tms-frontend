<script setup>
import { computed, ref, watch } from 'vue'
import {
  extractErrorMessage,
  mapPreviewErrorMessage,
  previewFee,
  scheduleTransfer
} from '../services/transferService'
import { formatCurrency, isValidAccount, todayIsoDate } from '../utils/formatters'

const emit = defineEmits(['scheduled'])

const sourceAccount = ref('')
const destinationAccount = ref('')
const amount = ref('')
const transferDate = ref('')
const loading = ref(false)
const previewLoading = ref(false)
const feePreview = ref(null)
const previewError = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const minDate = todayIsoDate()

const parsedAmount = computed(() => {
  const value = Number(amount.value)
  return Number.isFinite(value) && value > 0 ? value : null
})

const canPreviewFee = computed(() => {
  return parsedAmount.value !== null && transferDate.value !== ''
})

const canSubmit = computed(() => {
  return (
    isValidAccount(sourceAccount.value) &&
    isValidAccount(destinationAccount.value) &&
    sourceAccount.value !== destinationAccount.value &&
    parsedAmount.value !== null &&
    transferDate.value !== '' &&
    !loading.value
  )
})

watch([amount, transferDate], async () => {
  feePreview.value = null
  previewError.value = ''

  if (!canPreviewFee.value) {
    return
  }

  previewLoading.value = true
  try {
    feePreview.value = await previewFee(parsedAmount.value, transferDate.value)
  } catch (error) {
    previewError.value = mapPreviewErrorMessage(error)
  } finally {
    previewLoading.value = false
  }
})

watch([sourceAccount, destinationAccount, amount, transferDate], () => {
  if (successMessage.value) {
    const hasNewInput =
      sourceAccount.value !== '' ||
      destinationAccount.value !== '' ||
      amount.value !== '' ||
      transferDate.value !== ''

    if (hasNewInput) {
      successMessage.value = ''
    }
  }

  if (errorMessage.value) {
    errorMessage.value = ''
  }
})

function resetMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

function resetForm() {
  sourceAccount.value = ''
  destinationAccount.value = ''
  amount.value = ''
  transferDate.value = ''
  feePreview.value = null
  previewError.value = ''
}

async function handleSubmit() {
  resetMessages()
  previewError.value = ''

  if (!canSubmit.value) {
    errorMessage.value = 'Preencha todos os campos corretamente antes de agendar.'
    return
  }

  loading.value = true
  try {
    const result = await scheduleTransfer({
      sourceAccount: sourceAccount.value,
      destinationAccount: destinationAccount.value,
      amount: parsedAmount.value,
      transferDate: transferDate.value
    })

    successMessage.value = `Transferência agendada com sucesso! Taxa: ${formatCurrency(result.fee)}.`
    resetForm()
    emit('scheduled')
  } catch (error) {
    errorMessage.value = extractErrorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="panel">
    <header class="panel-header">
      <h2>Agendar transferência</h2>
      <p>Preencha os dados abaixo para agendar uma nova transferência financeira.</p>
    </header>

    <form class="form" @submit.prevent="handleSubmit">
      <div class="form-grid">
        <label class="field">
          <span>Conta de origem</span>
          <input
            v-model="sourceAccount"
            type="text"
            maxlength="10"
            inputmode="numeric"
            placeholder="0000000000"
            autocomplete="off"
          />
          <small>10 dígitos numéricos</small>
        </label>

        <label class="field">
          <span>Conta de destino</span>
          <input
            v-model="destinationAccount"
            type="text"
            maxlength="10"
            inputmode="numeric"
            placeholder="0000000000"
            autocomplete="off"
          />
          <small>10 dígitos numéricos</small>
        </label>

        <label class="field">
          <span>Valor da transferência</span>
          <input
            v-model="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
          />
        </label>

        <label class="field">
          <span>Data da transferência</span>
          <input v-model="transferDate" type="date" :min="minDate" />
        </label>
      </div>

      <div v-if="previewLoading" class="fee-box fee-box--loading">
        Calculando taxa...
      </div>

      <div v-else-if="previewError" class="alert alert--warning">
        {{ previewError }}
      </div>

      <div v-else-if="feePreview" class="fee-box">
        <div class="fee-box__title">Prévia da taxa</div>
        <div class="fee-box__grid">
          <div>
            <span>Prazo</span>
            <strong>{{ feePreview.daysUntilTransfer }} dia(s)</strong>
          </div>
          <div>
            <span>Valor fixo</span>
            <strong>{{ formatCurrency(feePreview.fixedFee) }}</strong>
          </div>
          <div>
            <span>Percentual</span>
            <strong>{{ feePreview.percentageRate }}%</strong>
          </div>
          <div>
            <span>Taxa total</span>
            <strong class="fee-highlight">{{ formatCurrency(feePreview.totalFee) }}</strong>
          </div>
        </div>
      </div>

      <div v-if="successMessage" class="alert alert--success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="alert alert--error">
        {{ errorMessage }}
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn--primary" :disabled="!canSubmit">
          {{ loading ? 'Agendando...' : 'Agendar transferência' }}
        </button>
      </div>
    </form>
  </section>
</template>
