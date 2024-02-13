<script>
import {mapActions, mapGetters, mapMutations} from "vuex";


import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import BackButton from "../shared/BackButton.vue";
import getEntityValues from "../../utils/getEntityValues";


import {
    mdiFileDocumentOutline,
    mdiFolder, mdiFolderOpen, mdiFolderPlus,
    mdiPlus, mdiDelete
} from "@mdi/js";
import store from "../../../../../src/app-store";
import ThreeDUtilities from "../../mixins/ThreeDUtilities";


export default {
    name: "FileForm",

    components: {
        BackButton
    },
    mixins: [ThreeDUtilities],

    props: {
        // The initial values for a step to edit
        editedStory: {
            type: Object,
            default: () => ({})
        },
        editedStep: {
            type: Object,
            default: () => ({...constants.emptyStep})
        }
    },
    data () {
        return {
            constants,
            // items: this.editedStep?.threeDLayers || {},
            tree: [],
            logos: {
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
            story: this.editedStory,
            step: this.editedStep,
            threeDFiles: this.editedStory.threeDFiles || [],
            definitiveThreeDFiles: [],
            key: 0,

            rootInputId: this.randomId()
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["namedProjections"])
        // ...mapGetters("Maps", ["altitude", "longitude", "latitude", "clickCoordinate", "mouseCoordinate"])

    },
    watch: {

        tree: {
            handler (val) {
                console.log("val", val);
                this.step = {
                    ...this.step,
                    selectedModelIds: val.map(id => ({
                        modelId: id,
                        ...getEntityValues(id)
                    }))
                };
            },
            deep: true
        }
    },
    async mounted () {
        // load the tree from this.step.selectedModelIds
        console.log(this.step);
        if (this.step.selectedModelIds) {
            this.tree = this.step.selectedModelIds.map(model => model.modelId);
        } else {
            this.tree = [];
        }

        // set map to 3d

        await this.enable3D();

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

        /**
         * Add a new folder to the tree
         * @param {string} parentId the id of the parent folder
         * @param {boolean} asChild true if the folder should be added as a child of the parent, false if it should be added as a sibling
         * @returns {void}
         */
        addFolder (parentId = null) {
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

        /**
         * Save the value of the folder input to state
         * @param {string} value the value of the input
         * @returns {void}
         */
        handleFolderInput (value) {
            this.addFolderInputValue = value;
        },

        /**
         * Clear the folder input
         * @returns {void}
         */
        resetFolderInput () {
            this.ignoreFolderChange = true;

            this.addFolderInputOpen = false;
            this.addFolderInputValue = "";

            this.forceFolderRerenderKey++;
            this.$nextTick(() => {
                this.ignoreFolderChange = false;
            });
        },

        /**
         * Add an item to the tree
         * @param {string} parentId the id of the parent item
         * @param {*} newItem the new item to add
         * @param {boolean} asChild true if the item should be added as a child of the parent, false if it should be added as a sibling
         * @returns {void}
         */
        addItem (parentId, newItem, asChild = true) {

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
            this.key++;
            this.definitiveThreeDFiles = this.threeDFiles;
            this.story.threeDFiles = this.threeDFiles;
        },

        /**
         * Rename an item in the tree
         * @param {string} itemId the id of the item to rename
         * @param {string} newName the new name of the item
         * @returns {void}
         */
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

        /**
         * Open the file selection dialog of the file input
         * @param {string} itemId the id the file input belongs to
         * @returns {void}
         */
        openFileDialog (itemId) {
            const element = this.$refs["fileInput" + itemId];

            element.click();
        },

        /**
         * Generate a random id for the tree items based on the current time for uniqueness
         * @returns {string} the random id
         */
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

        /**
         * Handle the file upload
         * @param {Event} event the event
         * @param {string} itemId the id of the item the file belongs to
         * @returns {void}
         */
        handleFileUpload (event, itemId) {
            for (const file of event.target.files) {
                const randomItemId = this.randomId(),
                    // Read the file into a Blob object
                    reader = new FileReader();

                reader.onload = (readerEvent) => {
                    // Create a new Blob object from the file data
                    const blob = new Blob([readerEvent.target.result], {type: file.type}),

                        // Create a new File object from the Blob
                        fileCopy = new File([blob], file.name, {type: file.type});

                    this.addItem(itemId, {
                        id: randomItemId,
                        name: fileCopy.name,
                        file: fileCopy.name.split(".").pop(),
                        obj: fileCopy
                    }, true);
                    this.importFile({files: [fileCopy], fileId: randomItemId});

                    if (file.name.split(".").pop() === "gltf" || file.name.split(".").pop() === "obj" || file.name.split(".").pop() === "dae") {
                        this.entityEditor(randomItemId);
                    }


                };
                reader.readAsArrayBuffer(file);
            }

            event.target.value = "";
        },

        /**
         * Open the entity editor
         * @param {string} entityId the id of the entity to edit
         * @returns {void}
         */
        entityEditor (entityId) {
            this.setSelectedEntityId(entityId);

            this.tree.push(entityId);

            console.log(this.tree);

            this.step = {
                ...this.step,
                selectedModelIds: this.tree.map(id => ({
                    modelId: id,
                    ...getEntityValues(id)
                }))
            };
            this.$emit("openEntityEditor", this.step);
        },

        /**
         * Remove an item from the tree
         * @param {string} itemId the id of the item to remove
         * @returns {void}
         */
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
        },

        /**
         * Create the FormData object from the tree
         * @returns {void}
         */
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
            this.story.threeDFiles = this.threeDFiles;
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
            ><v-icon>{{ logos.mdiFolderPlus }}</v-icon></v-btn>

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
                <v-icon>{{ logos.mdiPlus }}</v-icon>
            </v-btn>
        </span>
        <v-treeview
            :key="key"
            v-model="tree"
            :items="threeDFiles"
            item-children="children"
            activatable
            selectable
            open-all
        >
            <template #prepend="{ item, open }">
                <v-icon v-if="!item.file">
                    {{ open ? logos.mdiFolderOpen : logos.mdiFolder }}
                </v-icon>
                <v-icon v-else>
                    {{ constants.threeDManagerConstants.fileTypes[item.file] ? constants.threeDManagerConstants.fileTypes[item.file] : logos.mdiFileDocumentOutline }}
                </v-icon>
            </template>

            <template #label="{ item }">
                <div
                    :key="item.id"
                    class="fileLabel"
                >
                    <button
                        @click="event => {
                            event.stopPropagation();
                            if (item.file && item.name.split('.').pop() === 'gltf')
                                entityEditor(item.id)
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
                            class="fileInputFolder"
                            :disabled="item.file"
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
                            <v-icon>{{ logos.mdiPlus }}</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="!item.file"
                            icon
                            @click.stop="() => addFolder(item.id, true)"
                        >
                            <v-icon>{{ logos.mdiFolderPlus }}</v-icon>
                        </v-btn>
                        <v-btn
                            icon
                            @click.stop="() => removeItem(item.id)"
                        >
                            <v-icon>{{ logos.mdiDelete }}</v-icon>
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

    input.fileInputFolder {
        pointer-events: none;
    }

    .addFolderInput {
        display: none;

        &--open {
            display: block;
        }
    }
}
</style>
