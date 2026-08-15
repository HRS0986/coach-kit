"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildPdf, DaySchedule } from "@/lib/pdf";
import { cn } from "@/lib/utils";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from "date-fns";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    ChevronDown,
    ChevronUp,
    Download,
    Plus,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth-context";

function SortableTabTrigger({ id, dayName }: { id: string, dayName: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
        position: isDragging ? 'relative' : undefined,
    } as React.CSSProperties;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full shrink-0">
            <TabsTrigger
                value={id}
                className={cn(
                    "w-full justify-start data-active:bg-[#1f3a5e] data-[state=active]:bg-[#1f3a5e] data-active:text-white data-[state=active]:text-white data-active:opacity-100 data-active:shadow-md border border-transparent hover:bg-slate-100 data-active:hover:bg-[#1f3a5e] px-4 py-2.5 rounded-lg text-left whitespace-nowrap transition-colors font-medium opacity-70",
                    isDragging && "shadow-lg bg-slate-100 cursor-grabbing"
                )}
            >
                {dayName}
            </TabsTrigger>
        </div>
    );
}

export default function PreviewPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>("");
    const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(true);
    const [clientDetails, setClientDetails] = useState({
        clientName: "",
        trainerName: "Ravindu Nimsara",
        age: "",
        height: "",
        weight: "",
        bmi: "",
        workoutPeriod: "",
        date: "",
    });
    const [days, setDays] = useState<DaySchedule[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/");
            return;
        }

        // Read from session storage on mount
        const storedSchedule = sessionStorage.getItem("workoutData");
        if (storedSchedule) {
            try {
                const parsed = JSON.parse(storedSchedule);
                if (parsed.isManual) {
                    setIsManual(true);
                }
                if (parsed.days) {
                    const daysWithId = parsed.days.map((d: any) => ({ ...d, id: d.id || Math.random().toString(36).substring(2, 9) }));
                    setDays(daysWithId);
                    if (daysWithId.length > 0) setActiveTab(daysWithId[0].id);
                }
                setClientDetails((prev) => ({
                    ...prev,
                    clientName: parsed.name || prev.clientName,
                    age: parsed.age ? String(parsed.age) : prev.age,
                    height: parsed.height ? String(parsed.height) : prev.height,
                    weight: parsed.weight ? String(parsed.weight) : prev.weight,
                    bmi: parsed.bmi ? String(parsed.bmi) : prev.bmi,
                    workoutPeriod: parsed.workoutPeriod || prev.workoutPeriod,
                    date: parsed.date || prev.date,
                }));
            } catch (err) {
                console.error("Failed to parse stored schedule");
            }
            setIsLoaded(true);
        } else if (!authLoading) {
            // If no data, send back to home
            router.push("/dashboard");
        }
    }, [router, authLoading, user]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setDays((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleClientDetailChange = (field: string, value: string) => {
        setClientDetails((prev) => ({ ...prev, [field]: value }));
    };

    const handleExerciseChange = (
        dayIndex: number,
        exerciseIndex: number,
        field: string,
        value: string,
    ) => {
        const updatedDays = [...days];
        const item = { ...updatedDays[dayIndex].exercises[exerciseIndex] };

        (item as any)[field] = value;
        updatedDays[dayIndex].exercises[exerciseIndex] = item;
        setDays(updatedDays);
    };

    const handleAddExercise = (dayIndex: number) => {
        const updatedDays = [...days];
        updatedDays[dayIndex].exercises.push({
            no: updatedDays[dayIndex].exercises.length + 1,
            exercise: "New Exercise",
            sets: "3",
            reps: "10, 10, 10",
        });
        setDays(updatedDays);
    };

    const handleDeleteExercise = (dayIndex: number, exerciseIndex: number) => {
        const updatedDays = [...days];
        updatedDays[dayIndex].exercises.splice(exerciseIndex, 1);
        setDays(updatedDays);
    };

    const handleDayNameChange = (dayIndex: number, value: string) => {
        const updatedDays = [...days];
        updatedDays[dayIndex].dayName = value;
        setDays(updatedDays);
    };

    const handleAddDay = () => {
        const newDayId = Math.random().toString(36).substring(2, 9);
        const newDayName = `Day ${days.length + 1}`;
        setDays([...days, {
            id: newDayId,
            dayName: newDayName,
            exercises: []
        }]);
        setActiveTab(newDayId);
    };

    const generatePDF = () => {
        buildPdf(days, clientDetails);
    };

    if (!isLoaded || authLoading) return null; // loading or redirecting

    return (
        <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-start">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/dashboard")}
                        className="text-slate-500 hover:text-slate-900 mr-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-2xl text-[#1f3a5e] font-bold tracking-tight">
                        {isManual ? "Create Workout Schedule" : "Workout Schedule Preview"}
                    </h1>
                </div>

                {/* Collapsible Client Details */}
                <Collapsible
                    open={isClientDetailsOpen}
                    onOpenChange={setIsClientDetailsOpen}
                    className="w-full"
                >
                    <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden py-0">
                        <CollapsibleTrigger className="w-full text-left [&>*]:w-full">
                            <CardHeader className="flex flex-row items-center justify-between cursor-pointer bg-slate-200 px-6 pb-4 pt-2">
                                <div>
                                    <CardTitle>Client Details</CardTitle>
                                    <CardDescription>
                                        Edit the personal and program information for the header.
                                    </CardDescription>
                                </div>
                                <div className="p-2 bg-slate-100 rounded-full flex-shrink-0">
                                    {isClientDetailsOpen ? (
                                        <ChevronUp className="w-5 h-5 text-slate-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-500" />
                                    )}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <CardContent className="p-6 pt-0 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-slate-100">
                                <div className="space-y-2">
                                    <Label>Client Name</Label>
                                    <Input
                                        value={clientDetails.clientName}
                                        onChange={(e) =>
                                            handleClientDetailChange("clientName", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Workout Period</Label>
                                    <Input
                                        value={clientDetails.workoutPeriod}
                                        onChange={(e) =>
                                            handleClientDetailChange("workoutPeriod", e.target.value)
                                        }
                                        placeholder="e.g., 4 weeks"
                                    />
                                </div>
                                <div className="space-y-2 flex flex-col pt-2">
                                    <Label className="mb-1">Date</Label>
                                    <Popover>
                                        <PopoverTrigger
                                            render={
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !clientDetails.date && "text-slate-500",
                                                    )}
                                                />
                                            }
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {clientDetails.date ? (
                                                clientDetails.date
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    clientDetails.date &&
                                                        !isNaN(new Date(clientDetails.date).getTime())
                                                        ? new Date(clientDetails.date)
                                                        : undefined
                                                }
                                                onSelect={(d) =>
                                                    handleClientDetailChange(
                                                        "date",
                                                        d ? format(d, "PP") : "",
                                                    )
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Age</Label>
                                    <Input
                                        value={clientDetails.age}
                                        onChange={(e) =>
                                            handleClientDetailChange("age", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Height</Label>
                                    <Input
                                        value={clientDetails.height}
                                        onChange={(e) =>
                                            handleClientDetailChange("height", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Weight</Label>
                                    <Input
                                        value={clientDetails.weight}
                                        onChange={(e) =>
                                            handleClientDetailChange("weight", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>BMI</Label>
                                    <Input
                                        value={clientDetails.bmi}
                                        onChange={(e) =>
                                            handleClientDetailChange("bmi", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Trainer / Coach Name</Label>
                                    <Input
                                        value={clientDetails.trainerName}
                                        onChange={(e) =>
                                            handleClientDetailChange("trainerName", e.target.value)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* Schedule Tabs */}
                <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white pt-0">
                    <CardHeader className="border-b border-slate-100 bg-slate-200 pt-2">
                        <CardTitle>Workout Schedule</CardTitle>
                        <CardDescription>
                            Review and modify the extracted exercises day by day.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="flex flex-col md:flex-row w-full"
                            orientation="vertical"
                        >
                            <div className="w-full md:w-48 lg:w-64 border-b md:border-b-0 md:border-r">
                                <TabsList className="bg-transparent h-auto p-4 flex flex-row md:flex-col w-full justify-start space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto">
                                    <DndContext 
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext items={days.map(d => d.id)}>
                                            {days.map((day, idx) => (
                                                <SortableTabTrigger
                                                    key={day.id}
                                                    id={day.id}
                                                    dayName={day.dayName || `Day ${idx + 1}`}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                    <Button
                                        variant="outline"
                                        onClick={handleAddDay}
                                        className="w-full mt-2 border-dashed border-2 text-slate-500 hover:text-slate-900 border-slate-200 shrink-0"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Day
                                    </Button>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                {days.map((day, dayIndex) => (
                                    <TabsContent
                                        key={day.id}
                                        value={day.id}
                                        className="p-6 m-0 outline-none w-full"
                                    >
                                        <div className="mb-6 space-y-2">
                                            <Label className="text-slate-500">Day Name / Label</Label>
                                            <Input
                                                value={day.dayName}
                                                onChange={(e) =>
                                                    handleDayNameChange(dayIndex, e.target.value)
                                                }
                                                className="font-medium text-lg"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            {day.exercises.map((exercise, exIndex) => (
                                                <div
                                                    key={exIndex}
                                                    className="flex flex-col md:flex-row gap-3 p-4 bg-slate-100 border border-slate-100 rounded-lg group"
                                                >
                                                    <div className="flex-1 space-y-1">
                                                        <Label className="text-xs text-slate-500">
                                                            Exercise
                                                        </Label>
                                                        <Input
                                                            value={exercise.exercise}
                                                            onChange={(e) =>
                                                                handleExerciseChange(
                                                                    dayIndex,
                                                                    exIndex,
                                                                    "exercise",
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                    <div className="w-full md:w-24 space-y-1">
                                                        <Label className="text-xs text-slate-500">
                                                            Sets
                                                        </Label>
                                                        <Input
                                                            value={exercise.sets}
                                                            onChange={(e) =>
                                                                handleExerciseChange(
                                                                    dayIndex,
                                                                    exIndex,
                                                                    "sets",
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                    <div className="w-full md:w-32 space-y-1">
                                                        <Label className="text-xs text-slate-500">
                                                            Reps (comma sep)
                                                        </Label>
                                                        <Input
                                                            value={
                                                                exercise.reps ?? ""
                                                            }
                                                            onChange={(e) =>
                                                                handleExerciseChange(
                                                                    dayIndex,
                                                                    exIndex,
                                                                    "reps",
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                    <div className="flex items-end pb-0.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleDeleteExercise(dayIndex, exIndex)
                                                            }
                                                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                variant="outline"
                                                onClick={() => handleAddExercise(dayIndex)}
                                                className="w-full border-dashed border-2 py-8 text-slate-500 hover:text-slate-900 border-slate-200"
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> Add Exercise
                                            </Button>
                                        </div>
                                    </TabsContent>
                                ))}
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Generate Button */}
                <div className="sticky bottom-6 flex justify-end">
                    <Button
                        size="lg"
                        onClick={generatePDF}
                        className="bg-[#1f3a5e] hover:bg-[#1a2f4a] text-white shadow-lg px-8 rounded-full h-14 text-lg"
                    >
                        <Download className="w-5 h-5 mr-3" />
                        Export as PDF
                    </Button>
                </div>
            </div>
        </div>
    );
}
