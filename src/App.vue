<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>
import M from "materialize-css";

export default {
    name: 'App',
    mounted() {
        M.AutoInit();
        const elems = document.querySelectorAll('.modal');
        M.Modal.init(elems, {});
    }
}
</script>

