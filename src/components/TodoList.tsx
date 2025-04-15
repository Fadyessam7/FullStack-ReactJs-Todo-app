import Button from "./ui/Button";
import useCustomQuery from "../hooks/useAuthenticatedQuery";
import Modal from "./ui/Modal";
import { ChangeEvent, FormEvent, useState } from "react";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import { ITodo } from "../interfaces";
import axiosInstance from "../config/axios.config";
import TodoSkeleton from "./TodoSkeleton";
import { faker } from "@faker-js/faker";

const TodoList = () => {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  //** STATES
  const [isOpenEditModal, setIsEditModalOpen] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [queryVersion, setQueryVersion] = useState(1);
  const [todoToEdit, setTodoToEdit] = useState<ITodo>({
    id: 0,
    title: "",
    description: "",
    documentId: "",
  });
  const [todoToAdd, setTodoToAdd] = useState({
    title: "",
    description: "",
  });
  const { isLoading, data } = useCustomQuery({
    queryKey: ["todoList", `${queryVersion}`],
    url: "/users/me?populate=todos",
    config: {
      headers: {
        Authorization: `Bearer ${userData.jwt}`,
      },
    },
  });
  if (isLoading)
    return (
      <div className="space-y-1">
        {Array.from({ length: 3 }, (_, index) => (
          <TodoSkeleton key={index}></TodoSkeleton>
        ))}
      </div>
    );

  //** HANDLERS
  const onCloseEditModal = () => {
    setTodoToEdit({
      id: 0,
      title: "",
      description: "",
      documentId: "",
    });
    setIsEditModalOpen(false);
  };
  const onOpenEditModal = (todo: ITodo) => {
    setTodoToEdit(todo);
    setIsEditModalOpen(true);
  };

  const onOpenConfirmModal = (todo: ITodo) => {
    setIsOpenConfirmModal(true);
    setTodoToEdit(todo);
  };

  const onCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
    setTodoToEdit({
      id: 0,
      title: "",
      description: "",
      documentId: "",
    });
  };
  const onOpenAddModal = () => {
    setIsOpenAddModal(true);
  };

  const onCloseAddModal = () => {
    setIsOpenAddModal(false);
    setTodoToAdd({
      title: "",
      description: "",
    });
  };

  const onChangeHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = event.target;
    setTodoToEdit({
      ...todoToEdit,
      [name]: value,
    });
  };
  const onChangeAddTodoHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = event.target;
    setTodoToAdd({
      ...todoToAdd,
      [name]: value,
    });
  };

  const onRemove = async () => {
    try {
      const { status } = await axiosInstance.delete(
        `/todos/${todoToEdit.documentId}`,
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`,
          },
        }
      );
      if (status === 200) {
        onCloseConfirmModal();
        setQueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      onCloseConfirmModal();
    }
  };

  const onSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdating(true);
    const { title, description } = todoToEdit;
    try {
      const { status } = await axiosInstance.put(
        `/todos/${todoToEdit.documentId}`,
        {
          data: {
            title,
            description,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`,
          },
        }
      );
      if (status === 200) {
        onCloseEditModal();
        setQueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };
  const onSubmitAddTodoHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdating(true);
    const { title, description } = todoToAdd;
    try {
      const { status } = await axiosInstance.post(
        `/todos`,
        {
          data: {
            title,
            description,
            user: [userData.user.id],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`,
          },
        }
      );
      if (status === 200 || status === 201) {
        onCloseAddModal();
        setQueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };
  const onGenerateTodos = async () => {
    for (let index = 0; index < 100; index++) {
      try {
        await axiosInstance.post(
          `/todos`,
          {
            data: {
              title: faker.word.words(5),
              description: faker.lorem.paragraph(2),
              user: [userData.user.id],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${userData.jwt}`,
            },
          }
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="space-y-1">
      <div className="mx-auto w-fit my-10 flex space-x-2">
        <Button size={"sm"} onClick={onOpenAddModal}>
          Add A New Todo
        </Button>
        <Button size={"sm"} variant={"outline"} onClick={onGenerateTodos}>
          generate Todos
        </Button>
      </div>
      {data.todos.length ? (
        data.todos.reverse().map((todo: ITodo) => {
          return (
            <div
              key={todo.id}
              className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md even:bg-gray-100"
            >
              <p className="w-full font-semibold">
                {todo.id}- {todo.title}
              </p>
              <div className="flex items-center justify-end w-full space-x-3">
                <Button
                  variant={"default"}
                  size={"sm"}
                  onClick={() => onOpenEditModal(todo)}
                >
                  Edit
                </Button>
                <Button
                  size={"sm"}
                  variant={"danger"}
                  onClick={() => onOpenConfirmModal(todo)}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <h3>No Todos Yet!</h3>
      )}
      {/* Edit Todo Modal */}
      <Modal isOpen={isOpenEditModal} closeModal={onCloseEditModal}>
        <form className="space-y-4" onSubmit={onSubmitHandler}>
          <div className="space-y-1">
            {" "}
            <Input
              name="title"
              value={todoToEdit.title}
              onChange={onChangeHandler}
              required
            ></Input>
          </div>
          <Textarea
            name="description"
            value={todoToEdit.description}
            onChange={onChangeHandler}
          ></Textarea>
          <div className="flex items-center space-x-3 w-full">
            <Button
              fullWidth
              className="bg-indigo-700 hover:bg-indigo-800"
              isLoading={isUpdating}
            >
              Update
            </Button>
            <Button
              type="button"
              fullWidth
              variant={"cancel"}
              onClick={onCloseEditModal}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      {/* Remove Todo Modal */}
      <Modal
        isOpen={isOpenConfirmModal}
        closeModal={onCloseConfirmModal}
        title="Are you sure you want to remove this todo from your store ?"
        description="Deleting this todo will remove it permanently from your inventory. Any associated data, sales history, and other related information will also be deleted. Please make sure this is the intended action."
      >
        <div className="flex space-x-3">
          <Button onClick={onRemove} variant={"danger"}>
            Yes, Remove
          </Button>
          <Button
            type="button"
            onClick={onCloseConfirmModal}
            variant={"cancel"}
          >
            Cancel
          </Button>
        </div>
      </Modal>
      {/* Add New Todo Modal */}
      <Modal isOpen={isOpenAddModal} closeModal={onCloseAddModal}>
        <form className="space-y-3" onSubmit={onSubmitAddTodoHandler}>
          <Input
            placeholder="New Todo"
            name="title"
            value={todoToAdd.title}
            onChange={onChangeAddTodoHandler}
            required
          ></Input>
          <Textarea
            placeholder="Description"
            name="description"
            value={todoToAdd.description}
            onChange={onChangeAddTodoHandler}
          ></Textarea>
          <div className="flex items-center space-x-2">
            <Button variant={"default"} isLoading={isUpdating}>
              Add New Todo
            </Button>
            <Button type="button" variant={"cancel"} onClick={onCloseAddModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TodoList;
