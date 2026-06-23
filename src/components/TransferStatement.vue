<script setup>
import { onMounted, ref, watch } from 'vue'
import { extractErrorMessage, listTransfers } from '../services/transferService'
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters'

const props = defineProps({
  refreshToken: {
    type: Number,
    default: 0
  }
})

const transfers = ref([])
const loading = ref(false)
const errorMessage = ref('')

async function loadTransfers() {
  loading.value = true
  errorMessage.value = ''

  try {
    transfers.value = await listTransfers()
  } catch (error) {
    errorMessage.value = extractErrorMessage(error)
  } finally {
    loading.value = false
  }
}

onMounted(loadTransfers)

watch(
  () => props.refreshToken,
  () => {
    loadTransfers()
  }
)
</script>

<template>
  <section class="panel">
    <header class="panel-header panel-header--row">
      <div>
        <h2>Extrato de agendamentos</h2>
        <p>Consulte todas as transferências já agendadas no sistema.</p>
      </div>
      <button type="button" class="btn btn--secondary" :disabled="loading" @click="loadTransfers">
        {{ loading ? 'Atualizando...' : 'Atualizar' }}
      </button>
    </header>

    <div v-if="errorMessage" class="alert alert--error">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="empty-state">
      Carregando agendamentos...
    </div>

    <div v-else-if="transfers.length === 0" class="empty-state">
      Nenhum agendamento encontrado.
    </div>

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Valor</th>
            <th>Taxa</th>
            <th>Data transferência</th>
            <th>Criado em</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transfer in transfers" :key="transfer.id">
            <td>{{ transfer.id }}</td>
            <td>{{ transfer.sourceAccount }}</td>
            <td>{{ transfer.destinationAccount }}</td>
            <td>{{ formatCurrency(transfer.amount) }}</td>
            <td>{{ formatCurrency(transfer.fee) }}</td>
            <td>{{ formatDate(transfer.transferDate) }}</td>
            <td>{{ formatDateTime(transfer.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
