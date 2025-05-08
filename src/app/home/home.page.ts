import { Component, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonList, IonItem, IonLabel, IonButton, IonButtons, IonIcon, IonCheckbox, IonFab, IonFabButton, IonModal, IonInput, IonTextarea, IonNote, IonSearchbar, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { add, search, trash, pencil } from 'ionicons/icons'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskFilter, FilteredTask } from 'src/app/interfaces/task';
import { addTask, getAllTasks, updateTask, deleteTask } from '../db';

enum TaskModalType {
  New = 'New',
  Edit = 'Edit',
  View = 'View'
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonItemOption, IonItemOptions, IonItemSliding, IonSearchbar, IonNote, ReactiveFormsModule, IonTextarea, IonInput, IonModal, IonFabButton, IonFab,  FormsModule, IonCheckbox, IonIcon, IonButtons, IonButton, CommonModule, IonLabel, IonItem, IonList, IonSegmentButton, IonSegment, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
  @ViewChild('searchbar', { static: false }) searchbar!: IonSearchbar;

  public searching = false;
  public isTaskModalOpen: boolean = false;
  public taskModalType: TaskModalType = TaskModalType.New;
  public newTaskForm: FormGroup;
  
  private count_id: number = 0;
  private tasks: Task[] = [];
  private filteredTasks: FilteredTask[] = this.tasks.map(task => {
    const filteredTask: FilteredTask = {target: task};
    return filteredTask;
  });
  private taskFilter: TaskFilter = TaskFilter.All;

  constructor(private formBuilder: FormBuilder) {
    this.newTaskForm = formBuilder.group({
      id: [undefined],
      title: ['', Validators.required],
      description: [''],
      completed: [false]
    });

    addIcons({
      add, search, trash, pencil
    });

    this.initializeDB();
  }
  
  async initializeDB() {
    this.tasks = await getAllTasks();
    this.updateTasks();
  }

  searchTasks(tasks: Task[]) {
    const value = this.searchbar?.value?.toLocaleLowerCase() || '';
    return tasks.filter(task => {
      if(
        task.title.toLocaleLowerCase().trim().indexOf(value) != -1 ||
        task.description.toLocaleLowerCase().trim().indexOf(value) != -1
      ) {
        return true;
      }
      return false;
    });
  }

  filterTasksStatus(tasks: Task[]) {
    switch(this.taskFilter) {
      case TaskFilter.All:
        return tasks;
      case TaskFilter.Pending:
        return tasks.filter(task => !task.completed);
      case TaskFilter.Completed:
        return tasks.filter(task => task.completed);
    }
  }

  updateTasks() {
    this.filteredTasks = this.searchTasks(this.filterTasksStatus(this.tasks)).map(task => {
      const filteredTask: FilteredTask = {target: task};
      return filteredTask;
    });

    this.filteredTasks.forEach(ft => {
      this.tasks.forEach(t => {
        console.clear()
        console.table(this.tasks)
        console.table(this.getFilteredTasks())
      })
    })
  }

  async deleteTask(id: number) {
    await deleteTask(id);
    this.tasks = await getAllTasks();
    this.updateTasks();
  }

  setTaskFilter(taskFilter: TaskFilter | string | any) {
    if(typeof taskFilter === 'string')
    switch(taskFilter) {
      case 'completed':
        taskFilter = TaskFilter.Completed;
      break;
      case 'pending':
        taskFilter = TaskFilter.Pending;
      break;
      case 'all':
      default:
        taskFilter = TaskFilter.All;
      break;
    }
    this.taskFilter = taskFilter;
    this.updateTasks();
  }

  tasksIsEmpty() {
    return this.getFilteredTasks().length === 0;
  }

  getFilteredTasks() {
    return this.filteredTasks.map(filteredTask => filteredTask.target);
  }

  async onSubmit() {
    this.isTaskModalOpen = false;
    switch(this.taskModalType) {
      case TaskModalType.New:
        const newTask = this.newTaskForm.value;
        delete newTask.id;
        await addTask(newTask);
        this.tasks = await getAllTasks();
      break;
      case TaskModalType.Edit:
        const updatedTask = this.newTaskForm.value;
        await updateTask(this.newTaskForm.value.id, updatedTask);
        this.tasks = await getAllTasks();
      break;
    }
    
    this.updateTasks();
    this.newTaskForm.reset();
  }

  getTaskModalTitle() {
    switch(this.taskModalType) {
      case TaskModalType.View: return 'Visualizar Tarefa';
      case TaskModalType.Edit: return 'Editar Tarefa';
      case TaskModalType.New:  return 'Nova Tarefa';
    }
  }

  openNewTaskModal() {
    if(this.taskModalType != TaskModalType.New) 
      this.newTaskForm.reset();
    this.taskModalType = TaskModalType.New;
    this.isTaskModalOpen = true;
  }

  openViewTaskModal(task: Task) {
    this.taskModalType = TaskModalType.View;
    this.newTaskForm.setValue(task);
    this.isTaskModalOpen = true;
  }

  openEditTaskModal() {
    this.taskModalType = TaskModalType.Edit;
    this.isTaskModalOpen = true;
  }

  openEditTaskModalWithArgument(task: Task) {
    this.taskModalType = TaskModalType.Edit;
    this.newTaskForm.setValue(task);
    this.isTaskModalOpen = true;
  }

  closeNewTaskModal() {
    this.isTaskModalOpen = false;
  }

  openSearch() {
    this.searching = true;
    setTimeout(() => this.searchbar.setFocus(), 200);  
  } 

  closeSearch() {
    this.searching = false;
    this.searchbar.value = '';
  }
}
