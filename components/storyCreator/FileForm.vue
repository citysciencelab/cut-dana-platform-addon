<script>
import {mapActions, mapGetters, mapMutations} from "vuex";

import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";


import {
    mdiCodeJson,
    mdiFileDocumentOutline,
    mdiFileExcel,
    mdiFileImage,
    mdiFilePdf,
    mdiFolder,
    mdiFolderOpen,
    mdiFolderPlus,
    mdiLanguageHtml5,
    mdiLanguageMarkdown,
    mdiNodejs,
    mdiPlus
} from "@mdi/js";


export default {
    name: "FileForm",

    components: {

    },

    props: {
        // The initial values for a step to edit
        stepToEdit: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            constants,
            // items: this.editedStep?.threeDLayers || {},
            files: {
                html: mdiLanguageHtml5,
                js: mdiNodejs,
                json: mdiCodeJson,
                md: mdiLanguageMarkdown,
                pdf: mdiFilePdf,
                png: mdiFileImage,
                txt: mdiFileDocumentOutline,
                xls: mdiFileExcel
            },
            tree: [],
            items: [],
            // items: [
            //     {
            //         id: 1,
            //         name: ".git"
            //     },
            //     {
            //         id: 2,
            //         name: "node_modules"
            //     },
            //     {
            //         id: 3,
            //         name: "public",
            //         children: [
            //             {
            //                 id: 4,
            //                 name: "static",
            //                 children: [{
            //                     id: 5,
            //                     name: "logo.png",
            //                     file: "png"
            //                 }]
            //             },
            //             {
            //                 id: 6,
            //                 name: "favicon.ico",
            //                 file: "png"
            //             },
            //             {
            //                 id: 7,
            //                 name: "index.html",
            //                 file: "html"
            //             }
            //         ]
            //     },
            //     {
            //         id: 8,
            //         name: ".gitignore",
            //         file: "txt"
            //     },
            //     {
            //         id: 9,
            //         name: "babel.config.js",
            //         file: "js"
            //     },
            //     {
            //         id: 10,
            //         name: "package.json",
            //         file: "json"
            //     },
            //     {
            //         id: 11,
            //         name: "README.md",
            //         file: "md"
            //     },
            //     {
            //         id: 12,
            //         name: "vue.config.js",
            //         file: "js"
            //     },
            //     {
            //         id: 13,
            //         name: "yarn.lock",
            //         file: "txt"
            //     }
            // ],
            icons: {
                mdiFolder,
                mdiFolderOpen,
                mdiPlus,
                mdiFolderPlus
            }
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))


    },
    watch: {


    },
    mounted () {
        // console.log("mounted");
    },
    beforeDestroy () {
        // console.log("beforeDestroy");
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        addFolder (parentId = null, asChild = true) {
            console.log("addFolder", parentId, asChild);
            this.addItem(parentId, {
                id: this.randomId(),
                name: "new folder"
            }, asChild);
        },

        addItem (parentId, newItem, asChild = true) {
            // Create a copy of the items
            const itemsCopy = JSON.parse(JSON.stringify(this.items));

            if (!parentId) {
                // If no parent id is provided, add the item to the root
                itemsCopy.push(newItem);
                // Update the original items with the modified copy
                this.items = itemsCopy;
                return;
            }

            /**
             * Recursive function to add an item to the tree
             * @param {Array} items the items to search
             * @param {string} pId the id of the parent item
             * @param {*} nItem the new item to add
             * @returns {boolean} true if the item was added, false otherwise
             */
            function addRecursive (items, pId, nItem) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];

                    if (item.id === pId) {
                        // If the item is found and we are adding as a child
                        if (asChild) {
                            if (!item.children) {
                                item.children = []; // Initialize children array if not present
                            }
                            item.children.push(nItem);
                        }
                        else {
                            // If we are adding as a sibling
                            items.splice(i + 1, 0, nItem);
                        }
                        return true;
                    }
                    // If the item has children, recursively search them
                    if (item.children && addRecursive(item.children, pId, nItem)) {
                        return true;
                    }
                }
                return false;
            }

            // Use the copied items for recursive addition
            addRecursive(itemsCopy, parentId, newItem);

            // Update the original items with the modified copy
            this.items = itemsCopy;
        },


        renameItem (itemId, newName) {
            /**
             * Function to recursively search and rename the item
             * @param {Array} items the items to search
             * @returns {boolean} true if the item was renamed, false otherwise
             */
            function renameRecursive (items) {
                for (const item of items) {
                    if (item.id === itemId) {
                        item.name = newName;
                        return true;
                    }
                    // If the item has children, recursively search them
                    if (item.children && renameRecursive(item.children)) {
                        return true;
                    }
                }
                return false;
            }

            renameRecursive(this.items);
        },

        openFileDialog (index) {
            const element = this.$refs["fileInput" + index];

            element.click();
        },

        randomId () {
            let d = new Date().getTime(), // Timestamp
                d2 = ((typeof performance !== "undefined") && performance.now && (performance.now() * 1000)) || 0;// Time in microseconds since page-load or 0 if unsupported

            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                let r = Math.random() * 16;// random number between 0 and 16

                if (d > 0) { // Use timestamp until depleted
                    r = (d + r) % 16 | 0;
                    d = Math.floor(d / 16);
                }
                else { // Use microseconds since page-load if supported
                    r = (d2 + r) % 16 | 0;
                    d2 = Math.floor(d2 / 16);
                }
                return (c === "x" ? r : r & 0x3 | 0x8).toString(16);
            });
        },

        handleOpenUpdate (openItems) {
            console.log("Open items:", openItems);
        // You can set a breakpoint here for debugging
        // or perform additional actions as needed
        }

    }
};
</script>

<template lang="html">
    <div
        id="tool-dataNarrator-creator-3dForm"
        class="mb-8"
    >
        <h4>
            {{
                $t("additional:modules.tools.dataNarrator.3dForm")
            }}
        </h4>
        <span class="fileActions">
            <v-btn
                icon
                @click="() => addFolder(null, false)"
            ><v-icon>{{ icons.mdiFolderPlus }}</v-icon></v-btn>
        </span>
        <v-treeview
            v-model="tree"
            :items="items"
            item-children="children"
            activatable
            open-all
            @update:open="handleOpenUpdate"
        >
            <template #prepend="{ item, open }">
                <v-icon v-if="!item.file">
                    {{ open ? icons.mdiFolderOpen : icons.mdiFolder }}
                </v-icon>
                <v-icon v-else>
                    {{ files[item.file] }}
                </v-icon>
            </template>

            <template #label="{ item }">
                <div
                    :key="item.id"
                    class="fileLabel"
                >
                    <div>
                        <label :for="'fileInput' + item.id">{{ item.name }}</label>
                        <input
                            :id="'fileInput' + item.id"
                            :ref="'fileInput' + item.id"
                            type="file"
                            hidden
                            multiple
                        >
                    </div>

                    <!-- <v-file-input
                    :ref="'fileInput' + item.id"
                    v-model="files"
                    color="deep-purple accent-4"
                    multiple
                    :placeholder="item.name"
                    outlined
                    :hide-input="true"
                    :prepend-icon="null"
                /> -->
                    <div>
                        <v-btn
                            icon
                            @click.stop="openFileDialog(item.id)"
                        >
                            <v-icon>{{ icons.mdiPlus }}</v-icon>
                        </v-btn>
                        <v-btn
                            icon
                            @click.stop="() => addFolder(item.id, true)"
                        >
                            <v-icon>{{ icons.mdiFolderPlus }}</v-icon>
                        </v-btn>
                    </div>
                </div>
            </template>
        </v-treeview>
    </div>
</template>

<style lang="scss" scoped>

#tool-dataNarrator-creator-3dForm {
    max-width: 460px;
    position: relatieve;

    .fileActions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 100%;
    }

    .fileLabel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
}
</style>
