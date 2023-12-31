<script lang="ts" setup>
import { Ref, ref } from 'vue';
import Utils from '../utils';

const file: Ref<File | undefined> = ref()
const emit = defineEmits()
defineProps({
    image: {
        type: String,
        default: "",
        required: false,
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

async function onImageChange(event: Event) {
    const files = (event.target as HTMLInputElement).files
    if (files && files.length != 0) {
        file.value = files[0]
        const imageBase64 = await Utils.convertImageToBase64(file.value)
        emit("update:value", imageBase64)
    }
}

function onClearImage() {
    file.value = undefined
    emit('clear')
}

</script>

<template>
    <div class="flex flex-col w-full">
        <span v-if="image.length != 0 && !disabled" class="text-end text-blue-300 cursor-pointer p-0"
            @click="onClearImage">Clear</span>

        <div class="flex items-center justify-center w-full">
            <label v-if="image.length == 0" for="dropzone-file"
                class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                    </svg>
                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to
                            upload</span>
                        or drag and drop</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <input v-bind="file" id="dropzone-file" type="file" class="hidden" @change="onImageChange"
                    :disabled="disabled" />
            </label>
            <div v-else class="flex flex-col items-center justify-center pt-5 pb-6">
                <img :src="image" alt="Photo" class="w-full h-64 border-2 rounded-lg bg-cover" />
            </div>
        </div>
    </div>
</template>