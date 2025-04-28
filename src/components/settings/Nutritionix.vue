<template>
    <Setting :title="$t('settings.nutritionix')" :description="$t('settings.nutritionixDescription')" layout="vertical">
        <div class="mt-4 ml-4 grid grid-cols-[auto_1fr] gap-2">
            <Input
                v-model="$nutritionix.appId"
                :label="$t('settings.nutritionixAppId')"
                class="col-span-2 grid grid-cols-subgrid items-center"
                placeholder="12345678"
            />
            <Input
                v-model="$nutritionix.appKey"
                :label="$t('settings.nutritionixAppKey')"
                class="col-span-2 grid grid-cols-subgrid items-center"
                placeholder="123456789abcdefghijklmnopqrstuvw"
            />
        </div>
    </Setting>
</template>
