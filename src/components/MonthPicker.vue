<template>
    <div class="month-picker relative">
        <!-- Input field that shows selected month/year -->
        <button
            class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xl font-semibold text-gray-900 hover:bg-gray-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            @click="isPickerOpen = !isPickerOpen"
        >
            <span>{{ renderedValue }}</span>
            <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </button>

        <!-- Month picker dropdown -->
        <div
            v-if="isPickerOpen"
            class="absolute top-full left-0 z-10 mt-1 w-64 rounded-lg border border-gray-300 bg-white shadow-lg"
        >
            <!-- Year navigation header -->
            <div class="flex items-center justify-between border-b border-gray-200 p-3">
                <button class="rounded p-1 hover:bg-gray-100" @click="pickerYear--">
                    <svg
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
                <span class="font-semibold">{{ pickerYear }}</span>
                <button class="rounded p-1 hover:bg-gray-100" @click="pickerYear++">
                    <svg
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>

            <!-- Month grid -->
            <div class="p-3">
                <div class="grid grid-cols-3 gap-1">
                    <button
                        v-for="(month, index) in monthAbbreviations"
                        :key="index"
                        class="rounded px-3 py-2 text-sm transition-colors hover:bg-blue-50"
                        :class="{
                            'bg-blue-500 text-white hover:bg-blue-600':
                                model.month === index && model.year === pickerYear,
                            'text-gray-900': model.month !== index || model.year !== pickerYear,
                            'border border-blue-500': index === now.month && pickerYear === now.year,
                        }"
                        @click="selectMonth(index)"
                    >
                        {{ month }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { range } from '@noeldemartin/utils';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

interface MonthYear {
    month: number;
    year: number;
}

// Use defineModel() macro for v-model functionality
const model = defineModel<MonthYear>({
    default: () => ({ month: new Date().getMonth(), year: new Date().getFullYear() }),
});
const now = { month: new Date().getMonth(), year: new Date().getFullYear() };

// Month picker state
const isPickerOpen = ref(false);
const pickerYear = ref(model.value.year);
const monthAbbreviations = range(12).map((month) =>
    Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(0, month)));
const renderedValue = computed(() => {
    return Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(
        new Date(model.value.year, model.value.month),
    );
});

// Watch for changes in the model to update pickerYear
watch(
    () => model.value.year,
    (newYear) => {
        pickerYear.value = newYear;
    },
);

// Select month from picker
function selectMonth(month: number) {
    model.value = { month, year: pickerYear.value };
    isPickerOpen.value = false;
}

// Click outside handler to close picker
function handleClickOutside(event: Event) {
    const target = event.target as Element;
    if (!target.closest('.month-picker')) {
        isPickerOpen.value = false;
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>
