import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { Fontisto, Feather } from "@expo/vector-icons";

const TODOS_KEY = "todos";
const ISWORK_KEY = "iswork";

export default function App() {
  const [isWork, setIsWork] = useState(true);
  const [text, setText] = useState("");
  const [todos, setTodos] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const work = () => {
    setIsWork(true);
    AsyncStorage.setItem(ISWORK_KEY, "true");
  };
  const travel = () => {
    setIsWork(false);
    AsyncStorage.setItem(ISWORK_KEY, "false");
  };

  const onChangeText = (input) => {
    setText(input);
  };
  const loadTodos = async () => {
    try {
      const savedTodos = await AsyncStorage.getItem(TODOS_KEY);
      // empty: null
      // console.log(savedTodos);

      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    } catch (e) {}
  };
  const saveTodos = async (toSave) => {
    try {
      await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(toSave));
    } catch (e) {}
  };
  const addTodo = async () => {
    if (!text.length) {
      return;
    }

    const newTodos = {
      ...todos,
      [Date.now()]: { text, isWork, finished: false, isEditing: false },
    };
    setTodos(newTodos);
    await saveTodos(newTodos);
    setText("");
  };
  const deleteTodo = (id) => {
    if (Platform.OS == "web") {
      if (confirm("Are you sure?")) {
        const newTodos = { ...todos };
        delete newTodos[id];
        setTodos(newTodos);
        saveTodos(newTodos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        {
          text: "OK",
          onPress: () => {
            const newTodos = { ...todos };
            delete newTodos[id];
            setTodos(newTodos);
            saveTodos(newTodos);
          },
        },
        { text: "Cancel" },
      ]);
    }
  };

  const loadIsWork = async () => {
    try {
      const saveIsWork = await AsyncStorage.getItem(ISWORK_KEY);
      setIsWork(saveIsWork === "true" ? true : false);
    } catch (e) {}
  };

  const finishTodo = (id) => {
    const newTodos = { ...todos };
    newTodos[id].finished = !newTodos[id].finished;
    setTodos(newTodos);
    saveTodos(newTodos);
  };
  const editTodo = (id) => {
    const newTodos = { ...todos };
    newTodos[id].isEditing = !newTodos[id].isEditing;
    setTodos(newTodos);
  };
  const onChangeTodo = (id, text) => {
    const newTodos = { ...todos };
    newTodos[id].text = text;
    setTodos(newTodos);
  };
  const saveEditedTodo = (id) => {
    const newTodos = { ...todos };
    newTodos[id].isEditing = false;
    setTodos(newTodos);
    saveTodos(newTodos);
  };

  useEffect(() => {
    (async () => {
      await loadIsWork();
      await loadTodos();
      setIsLoading(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work} activeOpacity={0.5}>
          <Text style={{ ...styles.btnText, color: isWork ? "white" : theme.gray }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: isWork ? theme.gray : "white" }}>Travel</Text>
        </TouchableOpacity>
        {/* <TouchableHighlight onPress={() => {}} underlayColor="red" activeOpacity={0.3}>
          <Text style={styles.btnText}>Travel</Text>
        </TouchableHighlight>
        <TouchableWithoutFeedback>
          <Text style={{ color: "white", fontSize: 25 }}>Touch</Text>
        </TouchableWithoutFeedback>
        <Pressable>
          <Text style={{ color: "white", fontSize: 25 }}>Press</Text>
        </Pressable> */}
      </View>
      <TextInput
        style={styles.input}
        placeholder={isWork ? "Add a Todo" : "Where do you want to go?"}
        onChangeText={onChangeText}
        value={text}
        onSubmitEditing={addTodo}
        // keyboardType="visible-password"
        // returnKeyType="go"
        // returnKeyLabel="zz"
        // secureTextEntry
        // multiline
      />
      {isLoading ? (
        <Text style={styles.todoText}>Loading...</Text>
      ) : (
        <ScrollView>
          {Object.entries(todos)
            .filter(([id, todo]) => todo.isWork === isWork)
            .map(([id, todo]) => (
              <View key={id} style={styles.todo}>
                {todo.isEditing ? (
                  <TextInput
                    style={styles.todoInput}
                    value={todo.text}
                    onChangeText={(text) => {
                      onChangeTodo(id, text);
                    }}
                    onSubmitEditing={() => {
                      saveEditedTodo(id);
                    }}
                  />
                ) : (
                  <Text
                    style={{
                      ...styles.todoText,
                      color: todo.finished ? theme.gray : "white",
                      textDecorationLine: todo.finished ? "line-through" : "none",
                    }}
                  >
                    {todo.text}
                  </Text>
                )}

                <View style={styles.icons}>
                  <TouchableHighlight
                    onPress={() => {
                      editTodo(id);
                    }}
                    style={{ marginRight: 20 }}
                  >
                    <Feather name="edit" size={20} color={todo.isEditing ? "white" : theme.gray} />
                  </TouchableHighlight>
                  <TouchableHighlight
                    onPress={() => {
                      finishTodo(id);
                    }}
                    style={{ marginRight: 20 }}
                  >
                    <Fontisto
                      name={todo.finished ? "checkbox-active" : "checkbox-passive"}
                      size={20}
                      color={theme.gray}
                    />
                  </TouchableHighlight>
                  <TouchableOpacity
                    onPress={() => {
                      deleteTodo(id);
                    }}
                  >
                    <Fontisto name="trash" size={20} color={theme.gray} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  btnText: {
    fontSize: 40,
    // fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  todoInput: {
    width: "50%",
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  todo: {
    backgroundColor: theme.todoBackground,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  todoText: {
    fontSize: 18,
  },
  icons: {
    flexDirection: "row",
  },
});
