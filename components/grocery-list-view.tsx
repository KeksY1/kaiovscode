"use client"

import { motion } from "framer-motion"
import { usePlanStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ShoppingCart, CheckCircle2, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

const categoryColors: Record<string, string> = {
  produce: "bg-green-500/10 text-green-700 dark:text-green-400",
  protein: "bg-red-500/10 text-red-700 dark:text-red-400",
  dairy: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  grains: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  supplement: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  supplements: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  snacks: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  beverages: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
}

function getCategoryColor(category: string): string {
  return categoryColors[category.toLowerCase()] || "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
}

function EditItemDialog({ item }: { item: any }) {
  const { updateGroceryItemName, updateGroceryItemCategory } = usePlanStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState(item.category)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setName(item.name)
      setCategory(item.category)
    }
  }

  const handleSave = () => {
    if (name.trim()) {
      updateGroceryItemName(item.id, name.trim())
    }
    if (category.trim()) {
      updateGroceryItemCategory(item.id, category.trim())
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>Update the item name or category</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., produce, protein, snacks"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function GroceryListView() {
  const { groceryList, toggleGroceryItem, deleteGroceryItem } = usePlanStore()

  const groupedItems = groceryList.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof groceryList>,
  )

  const totalItems = groceryList.length
  const purchasedItems = groceryList.filter((item) => item.purchased).length
  const progress = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0

  if (groceryList.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Weekly Grocery List
              </CardTitle>
              <CardDescription>Your shopping list will appear here after generating a weekly plan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Generate a weekly plan from the Goals page to see your grocery list
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Weekly Grocery List
            </CardTitle>
            <CardDescription>
              {purchasedItems} of {totalItems} items purchased
            </CardDescription>
            <div className="mt-4">
              <div className="h-2 bg-primary/10 dark:bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-3 capitalize flex items-center gap-2">
                  <Badge className={getCategoryColor(category)}>{category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ({items.filter((i) => i.purchased).length}/{items.length})
                  </span>
                </h3>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        item.purchased ? "bg-primary/5 dark:bg-muted/50 border-primary/10 dark:border-muted" : "bg-primary/10 dark:bg-card border-primary/20 dark:border-border hover:bg-primary/20 dark:hover:bg-accent"
                      }`}
                    >
                      <Checkbox
                        checked={item.purchased}
                        onCheckedChange={() => toggleGroceryItem(item.id)}
                        className="h-5 w-5"
                      />
                      <span className={`flex-1 ${item.purchased ? "line-through text-muted-foreground" : ""}`}>
                        {item.name}
                      </span>
                      {item.purchased && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      <div className="flex items-center gap-1">
                        <EditItemDialog item={item} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteGroceryItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
