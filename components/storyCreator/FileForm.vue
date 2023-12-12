<script>
import {mapActions, mapGetters, mapMutations} from "vuex";


import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import BackButton from "../shared/BackButton.vue";


import {
    mdiCodeJson, mdiFileDocumentOutline, mdiFileExcel, mdiFileImage, mdiFilePdf,
    mdiFolder, mdiFolderOpen, mdiFolderPlus, mdiLanguageHtml5, mdiLanguageMarkdown,
    mdiNodejs, mdiPlus, mdiDelete
} from "@mdi/js";


const eventHandler = null;

export default {
    name: "FileForm",

    components: {
        BackButton
    },

    props: {
        // The initial values for a step to edit
        editedStep: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            constants,
            // items: this.editedStep?.threeDLayers || {},
            tree: [],
            icons: {
                mdiFolder,
                mdiFolderOpen,
                mdiPlus,
                mdiFolderPlus,
                mdiFileDocumentOutline,
                mdiDelete
            },
            addFolderInputOpen: false,
            addFolderInputValue: "",
            targetParentId: "",
            folderRules: [
                value => Boolean(value) || "Required.",
                value => (value && value.length >= 3) || "Min 3 characters"
            ],
            ignoreFolderChange: false,
            forceFolderRerenderKey: 0,
            step: this.editedStep,
            threeDFiles: this.editedStep.threeDFiles || [],

            rootInputId: this.randomId()
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Maps", ["altitude", "longitude", "latitude", "clickCoordinate", "mouseCoordinate"])


    },
    watch: {


    },
    mounted () {
        // set map to 3d

        // load the existing files

        // this.importFile({files: this.step.threeDFiles.map(file => file.obj), fileId: null});

        // console.log("mounted");
    },
    beforeDestroy () {
        // console.log("beforeDestroy");
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        ...mapMutations("Tools/Gfi", {setGfiActive: "setActive"}),


        addFolder (parentId = null, asChild = true) {
            this.targetParentId = parentId;
            this.addFolderInputOpen = true;
            const addFolderInput = this.$refs.addFolderInput;

            addFolderInput.focus();
            // console.log("addFolder", parentId, asChild);
            // this.addItem(parentId, {
            //     id: this.randomId(),
            //     name: "new folder"
            // }, asChild);
        },

        /**
         * Save the new folder
         * @returns {void}
         */
        saveNewFolder () {
            if (this.ignoreFolderChange === false) {
                this.addItem(this.targetParentId, {
                    id: this.randomId(),
                    name: this.addFolderInputValue
                }, true);
                this.resetFolderInput();

            }
        },

        handleFolderInput (value) {
            this.addFolderInputValue = value;
        },

        resetFolderInput () {
            this.ignoreFolderChange = true;

            this.addFolderInputOpen = false;
            this.addFolderInputValue = "";

            this.forceFolderRerenderKey++;
            this.$nextTick(() => {
                this.ignoreFolderChange = false;
            });
        },

        addItem (parentId, newItem, asChild = true) {
            // Create a copy of the items

            if (!parentId || parentId === "") {
                // If no parent id is provided, add the item to the root
                this.threeDFiles.push(newItem);
            }
            else {
                addRecursive(this.threeDFiles, parentId, newItem);
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

            console.log(this.threeDFiles);
            // Update the original items with the modified copy
            this.step.threeDFiles = this.threeDFiles;
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

            renameRecursive(this.threeDFiles);
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

        handleFileUpload (event, itemId) {
            for (const file of event.target.files) {
                const randomItemId = this.randomId(),

                    // Read the file into a Blob object
                    reader = new FileReader();

                reader.onload = (event) => {
                    // Create a new Blob object from the file data
                    const blob = new Blob([event.target.result], {type: file.type}),

                        // Create a new File object from the Blob
                        fileCopy = new File([blob], file.name, {type: file.type});

                    this.addItem(itemId, {
                        id: randomItemId,
                        name: fileCopy.name,
                        file: fileCopy.name.split(".").pop(),
                        obj: fileCopy
                    }, true);
                    this.importFile({files: [fileCopy], fileId: randomItemId});

                    if (file.name.split(".").pop() === "gltf") {
                        this.openEntityEditor(randomItemId);
                    }
                };
                reader.readAsArrayBuffer(file);
            }

            event.target.value = "";
            console.log(this.threeDFiles);
        },

        openEntityEditor (entityId) {
            this.setSelectedEntityId(entityId);
            this.$emit("openView", constants.storyCreationViews.ENTITY_EDITOR);
        },

        removeItem (itemId) {

            /**
             * Function to recursively search and remove the item
             * @param {Array} items the items to search
             * @returns {boolean} true if the item was removed, false otherwise
             */
            function removeRecursive (items) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];


                    if (item.id === itemId) {
                        items.splice(i, 1);
                        return true;
                    }
                    // If the item has children, recursively search them
                    if (item.children && item.children.length > 0) {
                        if (removeRecursive(item.children)) {
                            return true;
                        }
                        return false;
                    }
                }
                return false;
            }

            removeRecursive(this.threeDFiles);

            this.step.threeDFiles = this.threeDFiles;

        },

        createFormData () {
            // const formData = new FormData();

            // /**
            //  * Recursive function to process the tree and add files to FormData
            //  * @param {Array} node the tree to process
            //  * @param {string} path the path of the current node
            //  * @returns {void}
            //  */
            // function processNode (node, path = "") {
            //     if (node.file && node.obj) {
            //         // It's a file, append it to FormData
            //         const fullPath = path;

            //         formData.append(fullPath, node.obj);
            //     }
            //     else if (node.children && Array.isArray(node.children)) {
            //         // It's a folder, recurse into its children
            //         node.children.forEach(child => {
            //             processNode(child, path ? `${path}/${node.name}` : node.name);
            //         });
            //     }
            // }

            // this.items.forEach(node => {
            //     processNode(node);
            // });

            // for (const [key, value] of formData.entries()) {
            //     console.log(key, value);
            // }


            this.step.threeDFiles = this.threeDFiles;
            console.log("SUBMIT", this.step.threeDFiles);
            this.returnToStepForm();

        },


        /**
         * Handle return back to the stepForm
         * @returns {void}
         */
        returnToStepForm () {
            this.$emit("return", this.step);
        }


    }
};
</script>

<template lang="html">
    <div
        id="tool-dataNarrator-creator-3dForm"
        class="mb-8"
    >
        <v-row>
            <v-col
                cols="12"
            >
                <BackButton
                    tooltip="additional:modules.tools.dataNarrator.button.backToStep"
                    :text="step.title"
                    @click="returnToStepForm"
                />
            </v-col>
        </v-row>
        <h4>
            {{
                $t("additional:modules.tools.dataNarrator.3dForm")
            }}
        </h4>
        <span class="fileActions">
            <div
                :class="['addFolderInput', { 'addFolderInput--open': addFolderInputOpen }]"
            >
                <v-text-field
                    :key="forceFolderRerenderKey"
                    ref="addFolderInput"
                    :value="addFolderInputValue"
                    label="Folder name"
                    :rules="folderRules"
                    hide-details="auto"
                    @change="saveNewFolder"
                    @input="handleFolderInput"
                />
            </div>

            <v-btn
                icon
                @click="() => addFolder(null, false)"
            ><v-icon>{{ icons.mdiFolderPlus }}</v-icon></v-btn>

            <label :for="'fileInput' + rootInputId" />
            <input
                :id="'fileInput' + rootInputId"
                :ref="'fileInput' + rootInputId"
                type="file"
                multiple
                hidden
                @change="(event) => handleFileUpload(event, '')"
            >

            <v-btn
                icon
                @click.stop="openFileDialog(rootInputId)"
            >
                <v-icon>{{ icons.mdiPlus }}</v-icon>
            </v-btn>
        </span>
        <v-treeview
            v-model="tree"
            :items="threeDFiles"
            item-children="children"
            activatable
            open-all
        >
            <template #prepend="{ item, open }">
                <v-icon v-if="!item.file">
                    {{ open ? icons.mdiFolderOpen : icons.mdiFolder }}
                </v-icon>
                <v-icon v-else>
                    {{ constants.threeDManagerConstants.fileTypes[item.file] ? constants.threeDManagerConstants.fileTypes[item.file] : icons.mdiFileDocumentOutline }}
                </v-icon>
            </template>

            <template #label="{ item }">
                <div
                    :key="item.id"
                    class="fileLabel"
                >
                    <button
                        @click="event => {
                            if (item.file)
                                openEntityEditor(item.id)
                        }
                        "
                    >
                        <label :for="'fileInput' + item.id">{{ item.name }}</label>
                        <input
                            :id="'fileInput' + item.id"
                            :ref="'fileInput' + item.id"
                            type="file"
                            multiple
                            hidden
                            @change="(event) => {
                                if (!item.file) {
                                    handleFileUpload(event, item.id)
                                    return;
                                }
                            }"
                        >
                    </button>

                    <div>
                        <v-btn
                            v-if="!item.file"
                            icon
                            @click.stop="openFileDialog(item.id)"
                        >
                            <v-icon>{{ icons.mdiPlus }}</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="!item.file"
                            icon
                            @click.stop="() => addFolder(item.id, true)"
                        >
                            <v-icon>{{ icons.mdiFolderPlus }}</v-icon>
                        </v-btn>
                        <v-btn
                            icon
                            @click.stop="() => removeItem(item.id)"
                        >
                            <v-icon>{{ icons.mdiDelete }}</v-icon>
                        </v-btn>
                    </div>
                </div>
            </template>
        </v-treeview>
        <span>
            <v-btn
                color="primary"
                @click="() => createFormData()"
            >
                save
            </v-btn>
        </span>
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

    .addFolderInput {
        display: none;

        &--open {
            display: block;
        }
    }
}
</style>
