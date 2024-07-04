import ChooseTemplates from "@/components/ChooseTemplates";
import Navbar from "@/components/Navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Page = () => {
  return (
    <>
      <div>
        <Navbar />
        <div className="flex items-center justify-center my-16">
          <div>
            <h1 className="text-4xl font-semibold py-3">
              Templates recommended for you
            </h1>
          </div>
        </div>

        <div className="max-w-[70%] mx-auto ">
          {/* <div className="flex items-center shadow-lg rounded-lg p-3 bg-slate-100 justify-between">
            <div className="flex items-center justify-center gap-3">
              <h1 className="font-semibold">Filters : </h1>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Photo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="withphoto" className="cursor-pointer">
                    With Photo
                  </SelectItem>
                  <SelectItem value="withoutphoto" className="cursor-pointer">
                    Without Photo
                  </SelectItem>
                  <SelectItem value="any" className="cursor-pointer">
                    Any
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Columns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="cursor-pointer">
                    One Column
                  </SelectItem>
                  <SelectItem value="2" className="cursor-pointer">
                    Two Column
                  </SelectItem>
                  <SelectItem value="any" className="cursor-pointer">
                    Any
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          <ChooseTemplates />
        </div>
      </div>
    </>
  );
};

export default Page;
