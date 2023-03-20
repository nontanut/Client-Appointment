import {
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Hide,
  Input,
  InputGroup,
  InputLeftAddon,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface QueueData {
  firstName: string;
  lastName: string;
  phone: string;
  branch: number;
  appoint_date: Date;
  appoint_time: string;
}

interface Branches {
  id: number;
  branch: string;
}

interface Queue {
  branch_id: number;
  appoint_date: string;
  appoint_time: string;
  count: string;
}

function App() {
  const [time, setTime] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<QueueData>();
  const onSubmit = (data: QueueData) => {
    const newData = { ...data, appoint_time: time };

    axios
      .post(`${import.meta.env.VITE_API}/create`, { ...newData })
      .then((res) => {
        Swal.fire(
          "บันทึกเรียบเรียบ",
          "วันนัดหมายของท่านถูกบันทึกเรียบร้อยกรุณามาให้ตรงนัด",
          "success"
        );
      })
      .catch((err) => {
        Swal.fire("แจ้งเตือน", err.res.data.error, "error");
      });

    reset();
  };

  const { data } = useSWR<Branches[]>("/branches");
  const { data: free } = useSWR<Queue[]>("/check");

  let choosen_date = watch("appoint_date");
  let choosen_branch = watch("branch");

  const available = useMemo(() => {
    if (!free || choosen_branch === undefined) return new Map();

    const value = new Map<string, number>();
    const avabook = free.filter((b) => {
      const dateMatched = b.appoint_date === choosen_date.toJSON();
      const branchMatched = b.branch_id === choosen_branch;

      return branchMatched && dateMatched;
    });

    avabook.forEach((c) => {
      value.set(c.appoint_time, parseInt(c.count));
    });

    return value;
  }, [free, choosen_date, choosen_branch]);

  const isUnavailable = useCallback(
    (time: string) => {
      return available.get(time) >= 5;
    },
    [available]
  );

  if (!data) return null;

  return (
    <Container bg="gray.50">
      <Text
        // bgImage="url('https://cdn.pixabay.com/photo/2016/12/21/18/34/clouds-1923545_1280.png')"
        bgPosition="center"
        bgRepeat="no-repeat"
        objectFit="cover"
        fontSize="40px"
        align="center"
        pt={2}
        mt={2}
        fontWeight="bold"
        color="teal"
        borderBottom="4px"
        borderColor="teal"
      >
        ลงทะเบียน
      </Text>
      <Flex
        as="form"
        flexDirection="column"
        gap={2}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack direction={["column", "row"]}>
          <FormControl>
            <FormLabel pt={2}>ชื่อ</FormLabel>
            <Input
              {...register("firstName", {
                validate: (d) =>
                  d.search(/^[a-zA-Zก-๙]*$/) === -1
                    ? "ตัวอักษรเท่านั้น"
                    : undefined,
                required: true,
              })}
              isInvalid={!!errors.firstName}
              type="text"
              placeholder=""
              bg="white"
            />
            {errors.firstName?.message && (
              <FormHelperText color="red">
                {errors.firstName.message}
              </FormHelperText>
            )}
          </FormControl>

          <FormControl>
            <FormLabel pt={2}>นามสกุล</FormLabel>
            <Input
              {...register("lastName", {
                validate: (d) =>
                  d.search(/^[a-zA-Zก-๙]*$/) === -1
                    ? "ตัวอักษรเท่านั้น"
                    : undefined,
                required: true,
              })}
              type="text"
              bg="white"
              isInvalid={!!errors.lastName}
            />
            {errors.lastName?.message && (
              <FormHelperText color="red">
                {errors.lastName.message}
              </FormHelperText>
            )}
          </FormControl>
        </Stack>

        <FormControl>
          <FormLabel>เบอร์โทร</FormLabel>
          <InputGroup>
            <InputLeftAddon children="+66" bg="teal" color="white" />
            <Input
              {...register("phone", {
                validate: (d) =>
                  d.search(/^\d{10}$/) === -1
                    ? "ต้องเป็นตัวเลข 10 ตัวเท่านั้น"
                    : undefined,
                required: true,
              })}
              isInvalid={!!errors.phone}
              type="tel"
              bg="white"
            />
          </InputGroup>
          {errors.phone?.message && (
            <FormHelperText color="red">{errors.phone.message}</FormHelperText>
          )}
        </FormControl>
        <FormControl>
          <FormLabel>สาขา</FormLabel>
          <Select
            {...register("branch", {
              valueAsNumber: true,
            })}
            placeholder="เลือกสาขา"
            bg="white"
          >
            {data.map((d) => (
              <option key={d.id} value={d.id}>
                {d.branch}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>วันที่</FormLabel>
          <Input
            {...register("appoint_date", {
              valueAsDate: true,
              required: true,
              validate: (d) => {
                if (d.getTime() <= Date.now()) {
                  return "กรุณาเลือกวันที่อื่น";
                }
              },
            })}
            isInvalid={!!errors.appoint_date}
            type="date"
            bg="white"
          />
          {errors.appoint_date?.message && (
            <FormHelperText color="red">
              {errors.appoint_date.message}
            </FormHelperText>
          )}
        </FormControl>
        <FormControl>
          <FormLabel>เวลา</FormLabel>
          <RadioGroup onChange={setTime} value={time} colorScheme="teal">
            <Stack
              direction={["column", "row"]}
              wrap="wrap"
              spacing="space-between"
            >
              <Radio isDisabled={isUnavailable("12")} value="12">
                12:00 น.
              </Radio>
              <Radio isDisabled={isUnavailable("13")} value="13">
                13:00 น.
              </Radio>
              <Radio isDisabled={isUnavailable("14")} value="14">
                14:00 น.
              </Radio>
              <Radio isDisabled={isUnavailable("15")} value="15">
                15:00 น.
              </Radio>
              <Radio isDisabled={isUnavailable("16")} value="16">
                16:00 น.
              </Radio>
              <Radio isDisabled={isUnavailable("17")} value="17">
                17:00 น.
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        <FormControl pt={2} mb={2}>
          <Input
            type="submit"
            bg="teal"
            color="white"
            fontWeight="bold"
            cursor="pointer"
            value="บันทึก"
          />
        </FormControl>
      </Flex>
    </Container>
  );
}

export default App;
