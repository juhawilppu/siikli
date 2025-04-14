"use client"

import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    ChevronDown,
    ChevronRight,
    GripVertical,
    Save
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"


// Tuoteryhmät ja alituoteryhmät
interface Alituoteryhma {
    id: string
    nimi: string
    jarjestysnumero: number
}

interface Tuoteryhma {
    id: string
    nimi: string
    jarjestysnumero: number
    alituoteryhmat: Alituoteryhma[]
    isOpen?: boolean
}

// Esimerkkidata
const alkuperaisetTuoteryhmat: Tuoteryhma[] = [
    {
        id: "ryhma-1",
        nimi: "Viljat",
        jarjestysnumero: 1,
        alituoteryhmat: [
            { id: "aliryhma-1-1", nimi: "Vehnä", jarjestysnumero: 1 },
            { id: "aliryhma-1-2", nimi: "Ohra", jarjestysnumero: 2 },
            { id: "aliryhma-1-3", nimi: "Kaura", jarjestysnumero: 3 },
            { id: "aliryhma-1-4", nimi: "Ruis", jarjestysnumero: 4 },
        ],
    },
    {
        id: "ryhma-2",
        nimi: "Siemenet",
        jarjestysnumero: 2,
        alituoteryhmat: [
            { id: "aliryhma-2-1", nimi: "Perunansiemen", jarjestysnumero: 1 },
            { id: "aliryhma-2-2", nimi: "Ohransiemen", jarjestysnumero: 2 },
            { id: "aliryhma-2-3", nimi: "Kauransiemen", jarjestysnumero: 3 },
        ],
    },
    {
        id: "ryhma-3",
        nimi: "Jauhot",
        jarjestysnumero: 3,
        alituoteryhmat: [
            { id: "aliryhma-3-1", nimi: "Vehnäjauho", jarjestysnumero: 1 },
            { id: "aliryhma-3-2", nimi: "Ruisjauho", jarjestysnumero: 2 },
            { id: "aliryhma-3-3", nimi: "Ohrajauho", jarjestysnumero: 3 },
        ],
    },
    {
        id: "ryhma-4",
        nimi: "Hiutaleet",
        jarjestysnumero: 4,
        alituoteryhmat: [
            { id: "aliryhma-4-1", nimi: "Kaurahiutale", jarjestysnumero: 1 },
            { id: "aliryhma-4-2", nimi: "Ruishiutale", jarjestysnumero: 2 },
            { id: "aliryhma-4-3", nimi: "Vehnähiutale", jarjestysnumero: 3 },
        ],
    },
    {
        id: "ryhma-5",
        nimi: "Luomutuotteet",
        jarjestysnumero: 5,
        alituoteryhmat: [
            { id: "aliryhma-5-1", nimi: "Luomuvehnä", jarjestysnumero: 1 },
            { id: "aliryhma-5-2", nimi: "Luomukaura", jarjestysnumero: 2 },
            { id: "aliryhma-5-3", nimi: "Luomuruis", jarjestysnumero: 3 },
        ],
    },
]

// Sortable Item komponentti tuoteryhmille
function SortableTuoteryhma({
    tuoteryhma,
    onToggle,
    activeId,
}: {
    tuoteryhma: Tuoteryhma
    onToggle: (id: string) => void
    activeId: UniqueIdentifier | null
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: tuoteryhma.id,
        data: {
            type: "tuoteryhma",
            tuoteryhma,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: "relative" as const,
        zIndex: isDragging ? 1 : ("auto" as any),
    }

    return (
        <div ref={setNodeRef} style={style} className="mb-2">
            <Collapsible open={tuoteryhma.isOpen} onOpenChange={() => onToggle(tuoteryhma.id)}>
                <div
                    className={`flex items-center p-3 bg-white border rounded-md shadow-sm ${isDragging ? "border-primary" : ""}`}
                >
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 mr-2 text-gray-400 hover:text-gray-600"
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1">
                            {tuoteryhma.isOpen ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                        </Button>
                    </CollapsibleTrigger>
                    <div className="flex-1 font-medium">{tuoteryhma.nimi}</div>
                    <div className="text-sm text-gray-500">Järjestys: {tuoteryhma.jarjestysnumero}</div>
                </div>

                <CollapsibleContent>
                    <div className="pl-10 mt-1 space-y-1">
                        <SortableAlituoteryhmatContainer
                            tuoteryhmaId={tuoteryhma.id}
                            alituoteryhmat={tuoteryhma.alituoteryhmat}
                            activeId={activeId}
                        />
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

// Sortable Item komponentti alituoteryhmille
function SortableAlituoteryhma({
    alituoteryhma,
    tuoteryhmaId,
    activeId,
}: {
    alituoteryhma: Alituoteryhma
    tuoteryhmaId: string
    activeId: UniqueIdentifier | null
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: alituoteryhma.id,
        data: {
            type: "alituoteryhma",
            alituoteryhma,
            tuoteryhmaId,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center p-2 bg-white border rounded-md ${isDragging ? "border-primary" : ""}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 mr-2 text-gray-400 hover:text-gray-600"
            >
                <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1">{alituoteryhma.nimi}</div>
            <div className="text-sm text-gray-500">Järjestys: {alituoteryhma.jarjestysnumero}</div>
        </div>
    )
}

// Container komponentti alituoteryhmille
function SortableAlituoteryhmatContainer({
    tuoteryhmaId,
    alituoteryhmat,
    activeId,
}: {
    tuoteryhmaId: string
    alituoteryhmat: Alituoteryhma[]
    activeId: UniqueIdentifier | null
}) {
    return (
        <SortableContext items={alituoteryhmat.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {alituoteryhmat.map((alituoteryhma) => (
                <SortableAlituoteryhma
                    key={alituoteryhma.id}
                    alituoteryhma={alituoteryhma}
                    tuoteryhmaId={tuoteryhmaId}
                    activeId={activeId}
                />
            ))}
        </SortableContext>
    )
}

// Drag Overlay komponentit
function TuoteryhmaOverlay({ tuoteryhma }: { tuoteryhma: Tuoteryhma }) {
    return (
        <div className="flex items-center p-3 bg-white border border-primary rounded-md shadow-md">
            <div className="p-1 mr-2 text-gray-400">
                <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1 font-medium">{tuoteryhma.nimi}</div>
            <div className="text-sm text-gray-500">Järjestys: {tuoteryhma.jarjestysnumero}</div>
        </div>
    )
}

function AlituoteryhmaOverlay({ alituoteryhma }: { alituoteryhma: Alituoteryhma }) {
    return (
        <div className="flex items-center p-2 bg-white border border-primary rounded-md shadow-md">
            <div className="p-1 mr-2 text-gray-400">
                <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1">{alituoteryhma.nimi}</div>
            <div className="text-sm text-gray-500">Järjestys: {alituoteryhma.jarjestysnumero}</div>
        </div>
    )
}

export default function TuoteryhmatJarjestely() {
    const [searchQuery, setSearchQuery] = useState("")
    const [tuoteryhmat, setTuoteryhmat] = useState<Tuoteryhma[]>(
        alkuperaisetTuoteryhmat.map((ryhma) => ({ ...ryhma, isOpen: false })),
    )
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [activeItem, setActiveItem] = useState<any | null>(null)
    const [activeItemType, setActiveItemType] = useState<"tuoteryhma" | "alituoteryhma" | null>(null)
    const [muutoksiaTehty, setMuutoksiaTehty] = useState(false)

    const { toast } = useToast()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    // Tuoteryhmän avaaminen/sulkeminen
    const toggleTuoteryhma = (id: string) => {
        setTuoteryhmat((prev) => prev.map((ryhma) => (ryhma.id === id ? { ...ryhma, isOpen: !ryhma.isOpen } : ryhma)))
    }

    // Drag start handler
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id)

        // Tallenna aktiivinen elementti overlay-komponenttia varten
        if (active.data.current?.type === "tuoteryhma") {
            setActiveItem(active.data.current.tuoteryhma)
            setActiveItemType("tuoteryhma")
        } else if (active.data.current?.type === "alituoteryhma") {
            setActiveItem(active.data.current.alituoteryhma)
            setActiveItemType("alituoteryhma")
        }
    }

    // Drag end handler
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            setActiveItem(null)
            setActiveItemType(null)
            return
        }

        if (active.id !== over.id) {
            const activeData = active.data.current
            const overData = over.data.current

            // Tuoteryhmien järjestely
            if (activeData?.type === "tuoteryhma" && overData?.type === "tuoteryhma") {
                setTuoteryhmat((prev) => {
                    const oldIndex = prev.findIndex((item) => item.id === active.id)
                    const newIndex = prev.findIndex((item) => item.id === over.id)

                    const reordered = arrayMove(prev, oldIndex, newIndex)

                    // Päivitä järjestysnumerot
                    return reordered.map((item, index) => ({
                        ...item,
                        jarjestysnumero: index + 1,
                    }))
                })

                setMuutoksiaTehty(true)
            }
            // Alituoteryhmien järjestely
            else if (activeData?.type === "alituoteryhma" && overData?.type === "alituoteryhma") {
                // Varmista että alituoteryhmät ovat samassa tuoteryhmässä
                if (activeData.tuoteryhmaId === overData.tuoteryhmaId) {
                    setTuoteryhmat((prev) => {
                        return prev.map((ryhma) => {
                            if (ryhma.id === activeData.tuoteryhmaId) {
                                const oldIndex = ryhma.alituoteryhmat.findIndex((item) => item.id === active.id)
                                const newIndex = ryhma.alituoteryhmat.findIndex((item) => item.id === over.id)

                                const reorderedAlituoteryhmat = arrayMove(ryhma.alituoteryhmat, oldIndex, newIndex)

                                // Päivitä järjestysnumerot
                                return {
                                    ...ryhma,
                                    alituoteryhmat: reorderedAlituoteryhmat.map((item, index) => ({
                                        ...item,
                                        jarjestysnumero: index + 1,
                                    })),
                                }
                            }
                            return ryhma
                        })
                    })

                    setMuutoksiaTehty(true)
                }
            }
        }

        setActiveId(null)
        setActiveItem(null)
        setActiveItemType(null)
    }

    // Tallenna muutokset
    const tallennaMuutokset = () => {
        // Tässä lähetettäisiin muutokset palvelimelle
        console.log("Tallennetaan järjestys:", tuoteryhmat)

        toast({
            title: "Järjestys tallennettu",
            description: "Tuoteryhmien ja alituoteryhmien järjestys on päivitetty onnistuneesti.",
        })

        setMuutoksiaTehty(false)
    }

    // Palauta alkuperäinen järjestys
    const palautaAlkuperainenJarjestys = () => {
        setTuoteryhmat(alkuperaisetTuoteryhmat.map((ryhma) => ({ ...ryhma, isOpen: false })))
        setMuutoksiaTehty(false)

        toast({
            title: "Järjestys palautettu",
            description: "Tuoteryhmien ja alituoteryhmien järjestys on palautettu alkuperäiseksi.",
        })
    }

    // Suodata tuoteryhmät hakusanan perusteella
    const filteredTuoteryhmat = tuoteryhmat.filter(
        (ryhma) =>
            ryhma.nimi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ryhma.alituoteryhmat.some((aliryhma) => aliryhma.nimi.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    return (
        <div className="flex flex-col w-full">
            {/* Yläpalkki */}


            {/* Pääsisältö */}
            <main className="flex-1 overflow-auto p-6">
                <div className="space-y-6 max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tuoteryhmien järjestely</h1>
                        <p className="text-gray-600 mt-1">
                            Järjestele tuoteryhmiä ja alituoteryhmiä vetämällä ja pudottamalla. Muutokset tallentuvat vasta kun
                            painat Tallenna-painiketta.
                        </p>
                    </div>

                    {/* Toimintopainikkeet */}
                    <div className="flex justify-between items-center">
                        <Button variant="outline" onClick={palautaAlkuperainenJarjestys}>
                            Palauta alkuperäinen järjestys
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={tallennaMuutokset}
                            disabled={!muutoksiaTehty}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Tallenna muutokset
                        </Button>
                    </div>

                    {/* Ohjeistus */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-blue-700"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 16v-4" />
                                        <path d="M12 8h.01" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-blue-800 mb-1">Käyttöohje</h3>
                                    <ul className="text-blue-700 space-y-1 list-disc pl-5">
                                        <li>Vedä tuoteryhmää tai alituoteryhmää kahvakuvakkeesta.</li>
                                        <li>Pudota se haluamaasi kohtaan listalla.</li>
                                        <li>Avaa tuoteryhmä nuolikuvakkeesta nähdäksesi sen alituoteryhmät.</li>
                                        <li>Järjestysnumerot päivittyvät automaattisesti.</li>
                                        <li>Muista tallentaa muutokset Tallenna-painikkeella.</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Drag and Drop alue */}
                    <Card className="shadow-md">
                        <CardHeader className="border-b bg-gray-50 py-4">
                            <CardTitle>Tuoteryhmät ja alituoteryhmät</CardTitle>
                            <CardDescription>
                                {filteredTuoteryhmat.length} tuoteryhmää, yhteensä{" "}
                                {filteredTuoteryhmat.reduce((sum, ryhma) => sum + ryhma.alituoteryhmat.length, 0)} alituoteryhmää
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={tuoteryhmat.map((item) => item.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {filteredTuoteryhmat.map((tuoteryhma) => (
                                        <SortableTuoteryhma
                                            key={tuoteryhma.id}
                                            tuoteryhma={tuoteryhma}
                                            onToggle={toggleTuoteryhma}
                                            activeId={activeId}
                                        />
                                    ))}
                                </SortableContext>

                                <DragOverlay>
                                    {activeId && activeItemType === "tuoteryhma" && activeItem && (
                                        <TuoteryhmaOverlay tuoteryhma={activeItem} />
                                    )}
                                    {activeId && activeItemType === "alituoteryhma" && activeItem && (
                                        <AlituoteryhmaOverlay alituoteryhma={activeItem} />
                                    )}
                                </DragOverlay>
                            </DndContext>

                            {filteredTuoteryhmat.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    Ei tuoteryhmiä hakuehdoilla. Kokeile toista hakusanaa.
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="border-t bg-gray-50 py-3">
                            <div className="text-sm text-muted-foreground">
                                Voit avata ja sulkea tuoteryhmiä klikkaamalla nuolikuvaketta.
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    )
}
