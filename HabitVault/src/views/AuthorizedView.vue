<script setup lang="ts">
import axios from 'axios'
import { ref, type Ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import DrawerSideContent from '../components/DrawerSideContent.vue'
import { type Habit, getHabits } from '@/habit/Habit'

const emit = defineEmits<{
    updateAuthState: [auth: boolean]
}>()

function signOut() {
    axios.post('/signout').then(() => {
        emit('updateAuthState', false)
    })
}

const habits: Ref<Habit[]> = ref([])
updateHabits()
function updateHabits() {
    getHabits(
        (res) => {
            if (res != undefined)
                habits.value = res
        },
        (err) => { alert(err) })
}
</script>

<template>

    <div class="drawer lg:drawer-open min-h-dvh ">
        <input id="side-menu-drawer" type="checkbox" class="drawer-toggle" @click="updateHabits" />

        <div class="drawer-side z-40">
            <label for="side-menu-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
            <div class="flex flex-col p-4 w-80 min-h-full bg-base-200">
                <HelloWorld class="p-2" msg="HabitVault" />
                <div class="flex-row divide-x divide-gray-700">
                    <RouterLink class="p-2" active-class="text-primary" to="/">Home</RouterLink>
                    <RouterLink class="p-1" active-class="text-primary" @click="signOut" to="/login">Sign Out
                    </RouterLink>
                </div>
                <div class="divider" />
                <DrawerSideContent :habits="habits" @updateHabits="updateHabits" />
            </div>
        </div>

        <div class="drawer-content p-4 flex flex-col">
            <label for="side-menu-drawer" class="btn btn-ghost drawer-button lg:hidden justify-start">
                <span class="material-symbols-outlined">
                    menu
                </span>
            </label>
            <div class="grow">
                <RouterView :habits="habits" name="AuthorizedView" @updateHabits="updateHabits" />
            </div>
        </div>

    </div>

</template>
