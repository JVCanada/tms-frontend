<script setup>
import { ref } from 'vue'
import TransferForm from './components/TransferForm.vue'
import TransferStatement from './components/TransferStatement.vue'
import logoUrl from '../images/tokio-marine-seguradora.png'

const activeTab = ref('schedule')
const refreshToken = ref(0)

function handleScheduled() {
  refreshToken.value += 1
}

function switchTab(tab) {
  activeTab.value = tab
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__brand">
        <img
          class="app-header__logo"
          :src="logoUrl"
          alt="Tokio Marine Seguradora"
        />
      </div>
      <div class="app-header__content">
        <p class="app-header__eyebrow">TOKIO MARINE SEGURADORA</p>
        <h1>Agendamento de Transferências</h1>
        <p class="app-header__subtitle">
          Agende transferências financeiras e acompanhe o extrato de agendamentos.
        </p>
      </div>
    </header>

    <nav class="tabs" aria-label="Navegação principal">
      <button
        type="button"
        class="tabs__button"
        :class="{ 'tabs__button--active': activeTab === 'schedule' }"
        @click="switchTab('schedule')"
      >
        Agendar
      </button>
      <button
        type="button"
        class="tabs__button"
        :class="{ 'tabs__button--active': activeTab === 'statement' }"
        @click="switchTab('statement')"
      >
        Extrato
      </button>
    </nav>

    <main class="app-content">
      <TransferForm
        v-show="activeTab === 'schedule'"
        @scheduled="handleScheduled"
      />
      <TransferStatement
        v-show="activeTab === 'statement'"
        :refresh-token="refreshToken"
      />
    </main>
  </div>
</template>
